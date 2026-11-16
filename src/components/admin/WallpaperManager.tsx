"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest, jsonInit } from "@/components/admin/api-client";
import { formatDate } from "@/lib/utils";
import type { WallpaperSummary } from "@/lib/wallpapers/types";

type BulkAction = "publish" | "unpublish" | "feature" | "unfeature" | "delete" | "category";

export function WallpaperManager({ items, categories }: { items: WallpaperSummary[]; categories: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [moveTo, setMoveTo] = useState(categories[0]?.id ?? "");

  const allSelected = items.length > 0 && selected.size === items.length;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(action: BulkAction) {
    if (selected.size === 0) return;
    if (action === "delete" && !window.confirm(`Permanently delete ${selected.size} wallpaper(s) and their image files? This cannot be undone.`)) return;
    setBusy(true);
    const result = await adminRequest<{ affected: number }>("/api/admin/wallpapers/bulk", jsonInit("POST", { ids: [...selected], action, categoryId: action === "category" ? moveTo : undefined }));
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: result.error });
    setMessage({ ok: true, text: `Updated ${result.data.affected} wallpaper(s).` });
    setSelected(new Set());
    router.refresh();
  }

  async function quickPatch(id: string, patch: { published?: boolean; featured?: boolean }) {
    setBusy(true);
    const result = await adminRequest(`/api/admin/wallpapers/${id}`, jsonInit("PATCH", patch));
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: result.error });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="surface px-6 py-14 text-center">
        <p className="text-white">No wallpapers match these filters.</p>
        <Link href="/admin/wallpapers/upload" className="btn btn-primary mt-5">Upload wallpapers</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="surface mb-4 flex flex-wrap items-center gap-3 p-3" role="toolbar" aria-label="Bulk actions">
        <label className="inline-flex min-h-10 items-center gap-2 px-2 text-sm text-zinc-300">
          <input type="checkbox" className="size-4 accent-violet-500" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(items.map((item) => item.id)))} />
          {selected.size > 0 ? `${selected.size} selected` : "Select all"}
        </label>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || selected.size === 0} onClick={() => runBulk("publish")}>Publish</button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || selected.size === 0} onClick={() => runBulk("unpublish")}>Unpublish</button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || selected.size === 0} onClick={() => runBulk("feature")}>Feature</button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy || selected.size === 0} onClick={() => runBulk("unfeature")}>Unfeature</button>
        <span className="flex items-center gap-2">
          <label htmlFor="move-category" className="sr-only">Move selected to category</label>
          <select id="move-category" value={moveTo} onChange={(event) => setMoveTo(event.target.value)} className="field min-h-9 w-40 py-0 text-xs">
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy || selected.size === 0} onClick={() => runBulk("category")}>Move</button>
        </span>
        <button type="button" className="btn btn-danger btn-sm ml-auto" disabled={busy || selected.size === 0} onClick={() => runBulk("delete")}>Delete</button>
      </div>
      {message && <p role="status" className={`mb-4 rounded-xl border px-4 py-3 text-sm ${message.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>{message.text}</p>}

      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 ${selected.has(item.id) ? "border-violet-400/50 bg-violet-500/8" : "border-white/8 bg-white/3"}`}>
            <input type="checkbox" aria-label={`Select ${item.title}`} className="size-4 accent-violet-500" checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.thumbnailUrl} alt="" width={45} height={80} loading="lazy" className="h-20 w-11 rounded-lg object-cover" style={{ backgroundColor: item.color }} />
            <div className="min-w-0 flex-1 basis-48">
              <Link href={`/admin/wallpapers/${item.id}`} className="block truncate font-medium text-white hover:text-violet-300">{item.title}</Link>
              <p className="mt-0.5 truncate text-xs text-zinc-500">{item.categoryName} · {item.resolution} · {item.format.toUpperCase()} · {formatDate(item.publishedAt)} · {item.downloads} downloads</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-medium">
                <span className={`rounded-full px-2 py-0.5 ${item.published ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-500/20 text-zinc-300"}`}>{item.published ? "Published" : "Draft"}</span>
                {item.featured && <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-violet-200">Featured</span>}
                {item.isDemo && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">Starter</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => quickPatch(item.id, { published: !item.published })}>{item.published ? "Unpublish" : "Publish"}</button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => quickPatch(item.id, { featured: !item.featured })}>{item.featured ? "Unfeature" : "Feature"}</button>
              <Link href={`/admin/wallpapers/${item.id}`} className="btn btn-primary btn-sm">Edit</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
