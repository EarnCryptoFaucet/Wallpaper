import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { toErrorResponse } from "@/lib/admin-api";
import { guardAdmin, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const id = parseId((await params).id);
  const parsed = z.object({ isRead: z.boolean() }).safeParse(await request.json().catch(() => null));
  if (id === null || !parsed.success) return jsonError("Invalid request.", 400);
  try {
    await db.update(contactMessages).set({ isRead: parsed.data.isRead }).where(eq(contactMessages.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const id = parseId((await params).id);
  if (id === null) return jsonError("Invalid request.", 400);
  try {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
