import { NextResponse } from "next/server";
import { z } from "zod";
import { toErrorResponse } from "@/lib/admin-api";
import { guardAdmin, jsonError } from "@/lib/http";
import { importInbox } from "@/lib/inbox";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const importSchema = z.object({ categoryId: z.string().trim().min(1, "Choose a default category.").max(60), published: z.boolean() });

/** Imports all images waiting in content/inbox as new wallpapers. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const parsed = importSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  try {
    const result = await importInbox({ defaultCategoryId: parsed.data.categoryId, published: parsed.data.published });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
