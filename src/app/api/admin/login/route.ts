import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession, isAdminConfigured, verifyCredentials } from "@/lib/auth";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/http";

export const dynamic = "force-dynamic";

const loginSchema = z.object({ username: z.string().max(100), password: z.string().max(200) });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Request rejected.", 403);
  if (!isAdminConfigured()) {
    return jsonError("Admin is not configured. Set ADMIN_PASSWORD (10+ chars) and SESSION_SECRET (32+ chars) in your environment.", 503);
  }
  if (!rateLimit(`login:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
    return jsonError("Too many sign-in attempts. Please wait 15 minutes.", 429);
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Enter your username and password.", 400);

  if (!verifyCredentials(parsed.data.username, parsed.data.password)) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return jsonError("Incorrect username or password.", 401);
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
