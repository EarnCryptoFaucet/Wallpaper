import { NextResponse } from "next/server";
import { listWallpapers } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";

/** Public lookup of published wallpapers by id (used by the favorites page). */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map((id) => id.trim()).filter((id) => /^[a-z0-9-]{1,80}$/.test(id)))].slice(0, 100);
  if (ids.length === 0) return NextResponse.json({ items: [] });
  const items = await listWallpapers({ ids, limit: 100 });
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
