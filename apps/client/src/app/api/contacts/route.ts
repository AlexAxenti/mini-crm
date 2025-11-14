import { NextRequest } from "next/server";
import { proxy } from "../proxy";

// GET /api/contacts - List all contacts
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const queryString = url.search;
  return proxy(
    request,
    `${process.env.CONTACTS_SERVICE_URL}/contacts${queryString}`
  );
}

// POST /api/contacts - Create a contact
export async function POST(request: NextRequest) {
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/contacts`);
}
