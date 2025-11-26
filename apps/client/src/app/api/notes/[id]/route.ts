import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";
import { ServiceName } from "@/lib/api/service-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, ServiceName.CONTACTS, `/notes/${id}`);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, ServiceName.CONTACTS, `/notes/${id}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxy(request, ServiceName.CONTACTS, `/notes/${id}`);
}
