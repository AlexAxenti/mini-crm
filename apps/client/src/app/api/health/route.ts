import { NextResponse } from "next/server";

const CONTACTS_SERVICE_URL =
  process.env.CONTACTS_SERVICE_URL || "http://localhost:3001";
const EVENTS_SERVICE_URL =
  process.env.EVENTS_SERVICE_URL || "http://localhost:3002";

async function checkService(url: string, serviceName: string) {
  try {
    const response = await fetch(`${url}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        healthy: false,
        error: `Unable to reach ${serviceName}`,
        status: null,
      };
    }

    const healthData = await response.json();
    return {
      healthy: true,
      error: null,
      status: healthData,
    };
  } catch {
    return {
      healthy: false,
      error: `Unable to reach ${serviceName}`,
      status: null,
    };
  }
}

export async function GET() {
  const [contactsHealth, eventsHealth] = await Promise.all([
    checkService(CONTACTS_SERVICE_URL, "contacts service"),
    checkService(EVENTS_SERVICE_URL, "events service"),
  ]);

  return NextResponse.json({
    contacts: contactsHealth,
    events: eventsHealth,
  });
}
