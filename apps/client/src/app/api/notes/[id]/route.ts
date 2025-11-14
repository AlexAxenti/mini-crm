import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/notes/${id}`);
}

// PATCH /api/notes/[id] - Update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/notes/${id}`);
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/notes/${id}`);
}
