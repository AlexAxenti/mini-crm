import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";
import { ServiceName } from "@/lib/api/service-config";

// POST /api/contacts/[id]/notes - Create a note for a specific contact
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, ServiceName.CONTACTS, `/notes/${id}`);
}
