import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/admin-api";
import { guardAdmin } from "@/lib/http";
import { deleteDemoWallpapers } from "@/lib/wallpapers/service";

export const dynamic = "force-dynamic";

/** Removes every starter wallpaper (is_demo = true) together with its files. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ removed: await deleteDemoWallpapers() });
  } catch (error) {
    return toErrorResponse(error);
  }
}
