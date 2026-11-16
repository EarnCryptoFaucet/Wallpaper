"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { adminRequest, jsonInit } from "@/components/admin/api-client";
import { formatBytes, formatDate } from "@/lib/utils";
import type { WallpaperDetail } from "@/lib/wallpapers/types";

type Message = { ok: boolean; text: string } | null;

export function WallpaperEditor({ wallpaper, categories, maxUploadMb }: { wallpaper: WallpaperDetail; categories: Array<{ id: string; name: string }>; maxUploadMb: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [replaceMessage, setReplaceMessage] = useState<Message>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    const result = await adminRequest(
      `/api/admin/wallpapers/${wallpaper.id}`,
      jsonInit("PATCH", {
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        categoryId: String(form.get("categoryId") ?? ""),
        tags: String(form.get("tags") ?? "").split(","),
        featured: form.get("featured") === "on",
        published: form.get("published") === "on",
      }),
    );
    setSaving(false);
    setMessage(result.ok ? { ok: true, text: "Saved." } : { ok: false, text: result.error });
    if (result.ok) router.refresh();
  }

  async function replaceImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return setReplaceMessage({ ok: false, text: "Choose an image file first." });
    if (file.size > maxUploadMb * 1024 * 1024) return setReplaceMessage({ ok: false, text: `File is larger than ${maxUploadMb} MB.` });
    setReplacing(true);
    setReplaceMessage(null);
    const result = await adminRequest<{ wallpaper: { resolution: string } }>(`/api/admin/wallpapers/${wallpaper.id}/replace`, { method: "POST", body: form });
    setReplacing(false);
    if (!result.ok) return setReplaceMessage({ ok: false, text: result.error });
    formElement.reset();
    setReplaceMessage({ ok: true, text: `Image replaced (${result.data.wallpaper.resolution}). The URL, title, category and statistics were kept.` });
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Permanently delete “${wallpaper.title}” and its image files? This cannot be undone.`)) return;
    const result = await adminRequest(`/api/admin/wallpapers/${wallpaper.id}`, jsonInit("DELETE"));
    if (!result.ok) return setMessage({ ok: false, text: result.error });
    router.replace("/admin/wallpapers");
    router.refresh();
  }

  const banner = (value: Message) =>
    value && (
      <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${value.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>{value.text}</p>
    );

  return (
    <div className="grid gap-8 xl:grid-cols-[20rem_1fr]">
      <div className="grid content-start gap-6">
        <div className="surface overflow-hidden p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={wallpaper.previewUrl} src={wallpaper.previewUrl} alt={wallpaper.title} width={wallpaper.width} height={wallpaper.height} className="mx-auto h-auto max-h-[60vh] w-auto max-w-full rounded-xl" style={{ backgroundColor: wallpaper.color }} />
        </div>
        <dl className="surface grid grid-cols-2 gap-3 p-4 text-sm">
          <div><dt className="text-zinc-500">Resolution</dt><dd className="text-white">{wallpaper.resolution}</dd></div>
          <div><dt className="text-zinc-500">Aspect</dt><dd className="text-white">{wallpaper.aspectRatio}</dd></div>
          <div><dt className="text-zinc-500">Format</dt><dd className="text-white">{wallpaper.format.toUpperCase()}</dd></div>
          <div><dt className="text-zinc-500">Size</dt><dd className="text-white">{formatBytes(wallpaper.fileSize)}</dd></div>
          <div><dt className="text-zinc-500">Downloads</dt><dd className="text-white">{wallpaper.downloads}</dd></div>
          <div><dt className="text-zinc-500">Published</dt><dd className="text-white">{formatDate(wallpaper.publishedAt)}</dd></div>
          <div className="col-span-2"><dt className="text-zinc-500">ID (permanent)</dt><dd className="break-all text-white">{wallpaper.id}</dd></div>
          <div className="col-span-2"><dt className="text-zinc-500">Original file</dt><dd className="break-all text-white">content/wallpapers/original/{wallpaper.originalFile}</dd></div>
        </dl>
        {wallpaper.published && <Link href={`/wallpaper/${wallpaper.id}`} target="_blank" className="btn btn-ghost">View public page ↗</Link>}
      </div>

      <div className="grid content-start gap-8">
        <form onSubmit={save} className="surface grid gap-5 p-5 sm:p-6" aria-labelledby="details-title">
          <h2 id="details-title" className="font-display text-xl font-semibold text-white">Details</h2>
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input id="title" name="title" defaultValue={wallpaper.title} required maxLength={120} className="field" />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" name="description" defaultValue={wallpaper.description} maxLength={2000} rows={4} className="field" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="categoryId" className="label">Category</label>
              <select id="categoryId" name="categoryId" defaultValue={wallpaper.categoryId} className="field">
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="label">Tags (comma separated)</label>
              <input id="tags" name="tags" defaultValue={wallpaper.tags.join(", ")} className="field" />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-300">
            <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" name="published" defaultChecked={wallpaper.published} className="size-4 accent-violet-500" /> Published</label>
            <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" name="featured" defaultChecked={wallpaper.featured} className="size-4 accent-violet-500" /> Featured</label>
          </div>
          {banner(message)}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            <button type="button" className="btn btn-danger ml-auto" onClick={remove}>Delete wallpaper</button>
          </div>
        </form>

        <form onSubmit={replaceImage} className="surface grid gap-4 p-5 sm:p-6" aria-labelledby="replace-title">
          <h2 id="replace-title" className="font-display text-xl font-semibold text-white">Replace image</h2>
          <p className="text-sm leading-relaxed text-zinc-400">Upload a new file for this wallpaper. Its ID, public URL, title, description, category, tags, featured status and download count are all preserved. Thumbnails and previews are regenerated automatically.</p>
          <div>
            <label htmlFor="replace-file" className="label">New image (JPEG, PNG, WEBP, AVIF · max {maxUploadMb} MB)</label>
            <input id="replace-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="field py-2.5 file:mr-4 file:rounded-full file:border-0 file:bg-violet-500 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-white" />
          </div>
          {banner(replaceMessage)}
          <div><button type="submit" className="btn btn-primary" disabled={replacing}>{replacing ? "Replacing…" : "Replace image"}</button></div>
        </form>
      </div>
    </div>
  );
}
