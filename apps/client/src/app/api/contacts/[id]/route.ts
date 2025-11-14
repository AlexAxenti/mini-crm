import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";

// GET /api/contacts/:id - Get a contact by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/contacts/${id}`);
}

// PATCH /api/contacts/:id - Update a contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/contacts/${id}`);
}

// DELETE /api/contacts/:id - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/contacts/${id}`);
}
