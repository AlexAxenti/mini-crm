import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";
import { ServiceName } from "@/lib/api/service-config";

export async function POST(request: NextRequest) {
  return proxy(request, ServiceName.CONTACTS, "/users");
}

export async function GET(request: NextRequest) {
  return proxy(request, ServiceName.CONTACTS, "/users/me");
}
