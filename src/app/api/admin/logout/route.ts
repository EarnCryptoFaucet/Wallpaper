import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth";
import { isSameOrigin, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Request rejected.", 403);
  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}
