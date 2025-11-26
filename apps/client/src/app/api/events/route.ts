import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";
import { ServiceName } from "@/lib/api/service-config";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const queryString = url.search;
  return proxy(request, ServiceName.EVENTS, `/events${queryString}`);
}
