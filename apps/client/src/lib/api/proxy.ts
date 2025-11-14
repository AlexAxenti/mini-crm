import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function verifyAuth(request: NextRequest) {
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

  return { user, accessToken, error: null };
}

export async function proxy(request: NextRequest, targetUrl: string) {
  // 1. Verify authentication
  const { user, accessToken, error } = await verifyAuth(request);

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Prepare headers
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("x-api-key", process.env.CONTACTS_API_KEY!);
  headers.set("x-supabase-token", accessToken || "");

  // 3. Get request body if present
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const jsonBody = await request.json();
      body = JSON.stringify(jsonBody);
    } catch {
      // No body or invalid JSON
    }
  }

  // 4. Forward the request to NestJS
  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const data = await res.json();

    // 5. Return the response from NestJS
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
