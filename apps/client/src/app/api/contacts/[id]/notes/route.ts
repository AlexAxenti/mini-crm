import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";

// POST /api/contacts/[id]/notes - Create a note for a specific contact
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/notes/${id}`);
}
