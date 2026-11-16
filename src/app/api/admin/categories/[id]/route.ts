import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, wallpapers } from "@/db/schema";
import { toErrorResponse } from "@/lib/admin-api";
import { guardAdmin, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters.").max(40),
  description: z.string().trim().max(200),
  sortOrder: z.number().int().min(0).max(9999),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  try {
    // The id (URL slug) is intentionally immutable so links and wallpaper assignments never break.
    const updated = await db.update(categories).set(parsed.data).where(eq(categories.id, id)).returning();
    if (updated.length === 0) return jsonError("Category not found.", 404);
    return NextResponse.json({ category: updated[0] });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    const [usage] = await db.select({ count: sql<number>`count(*)::int` }).from(wallpapers).where(eq(wallpapers.categoryId, id));
    if ((usage?.count ?? 0) > 0) {
      return jsonError(`This category still contains ${usage?.count} wallpaper(s). Move them to another category first (Wallpapers → select → Move to category).`, 409);
    }
    const removed = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (removed.length === 0) return jsonError("Category not found.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
