import { NextRequest } from "next/server";
import { proxy } from "@/lib/api/proxy";

export async function POST(request: NextRequest) {
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/users`);
}

export async function GET(request: NextRequest) {
  return proxy(request, `${process.env.CONTACTS_SERVICE_URL}/users/me`);
}
