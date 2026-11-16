import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { toErrorResponse } from "@/lib/admin-api";
import { guardAdmin, jsonError } from "@/lib/http";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters.").max(40),
  description: z.string().trim().max(200).default(""),
});

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);

  const id = slugify(parsed.data.name);
  if (!id) return jsonError("Category name must contain letters or numbers.", 400);

  try {
    const [{ next }] = await db.select({ next: sql<number>`coalesce(max(${categories.sortOrder}), -1) + 1` }).from(categories);
    const inserted = await db
      .insert(categories)
      .values({ id, name: parsed.data.name, description: parsed.data.description, sortOrder: next })
      .onConflictDoNothing()
      .returning();
    if (inserted.length === 0) return jsonError("A category with this name already exists.", 409);
    return NextResponse.json({ category: inserted[0] }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
