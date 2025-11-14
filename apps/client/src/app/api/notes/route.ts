import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";

// GET /api/notes - List all notes (for the authenticated user)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const queryString = url.search;
  return proxy(
    request,
    `${process.env.CONTACTS_SERVICE_URL}/notes${queryString}`
  );
}
