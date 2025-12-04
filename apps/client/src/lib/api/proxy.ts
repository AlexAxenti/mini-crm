import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ServiceName, getServiceConfig } from "./service-config";
import { rateLimit } from "./rate-limiter";

export async function verifyAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  // Get the access token
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  console.log(accessToken);

  return { user, accessToken, error: null };
}

export async function proxy(
  request: NextRequest,
  service: ServiceName,
  path: string
) {
  // 1. Verify authentication
  const { user, accessToken, error } = await verifyAuth();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limiting
  const rateLimitResult = rateLimit(user.id);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // 3. Get service configuration
  console.log("service:", service);
  const config = getServiceConfig(service);
  console.log("Service config:", config);
  console.log("Proxying request to:", config.url + path);
  const targetUrl = `${config.url}${path}`;

  // 4. Prepare headers
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("x-api-key", config.apiKey);
  headers.set("x-supabase-token", accessToken || "");

  // 5. Get request body if present
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const jsonBody = await request.json();
      body = JSON.stringify(jsonBody);
    } catch {
      console.error("Failed to parse request body");
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  }

  // 6. Forward the request to NestJS
  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const data = await res.json();

    // 7. Return the response from NestJS
    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to service" },
      { status: 502 }
    );
  }
}
