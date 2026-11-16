"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { adminRequest, jsonInit } from "@/components/admin/api-client";
import { formatBytes } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

type ItemStatus = "queued" | "uploading" | "done" | "error";
interface QueueItem {
  key: string;
  file: File;
  title: string;
  status: ItemStatus;
  error?: string;
  wallpaperId?: string;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

/** crypto.randomUUID() only exists in secure contexts (HTTPS/localhost); a counter works everywhere. */
let keyCounter = 0;
function nextKey(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${keyCounter}`;
}

function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function UploadManager({ categories, maxUploadMb, inboxCount }: { categories: Option[]; maxUploadMb: number; inboxCount: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [importCategory, setImportCategory] = useState(categories[0]?.id ?? "");
  const [importPublish, setImportPublish] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function addFiles(files: FileList | File[]) {
    const additions: QueueItem[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      const typeOk = ACCEPTED.includes(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
      if (!typeOk) rejected.push(`${file.name}: unsupported type`);
      else if (file.size > maxUploadMb * 1024 * 1024) rejected.push(`${file.name}: larger than ${maxUploadMb} MB`);
      else additions.push({ key: nextKey(`${file.size}`), file, title: titleFromFilename(file.name), status: "queued" });
    }
    setQueue((current) => [...current, ...additions]);
    setNotice(rejected.length ? `Skipped: ${rejected.join("; ")}` : null);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function patchItem(key: string, patch: Partial<QueueItem>) {
    setQueue((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  async function uploadAll() {
    if (!categoryId) {
      setNotice("Create a category first (Admin → Categories).");
      return;
    }
    setUploading(true);
    setNotice(null);
    const pending = queue.filter((item) => item.status === "queued" || item.status === "error");
    for (const item of pending) {
      patchItem(item.key, { status: "uploading", error: undefined });
      const form = new FormData();
      form.set("file", item.file);
      form.set("title", item.title);
      form.set("categoryId", categoryId);
      form.set("tags", tags);
      form.set("published", String(published));
      form.set("featured", String(featured));
      const result = await adminRequest<{ wallpaper: { id: string } }>("/api/admin/wallpapers", { method: "POST", body: form });
      if (result.ok) patchItem(item.key, { status: "done", wallpaperId: result.data.wallpaper.id });
      else patchItem(item.key, { status: "error", error: result.error });
    }
    setUploading(false);
    router.refresh();
  }

  async function runImport() {
    setImporting(true);
    setImportMessage(null);
    const result = await adminRequest<{ imported: unknown[]; failed: Array<{ file: string; error: string }> }>(
      "/api/admin/import",
      jsonInit("POST", { categoryId: importCategory, published: importPublish }),
    );
    setImporting(false);
    if (!result.ok) {
      setImportMessage({ ok: false, text: result.error });
      return;
    }
    const failed = result.data.failed.map((entry) => `${entry.file} (${entry.error})`);
    setImportMessage({
      ok: failed.length === 0,
      text: `Imported ${result.data.imported.length} wallpaper(s).${failed.length ? ` Failed: ${failed.join("; ")}` : ""}`,
    });
    router.refresh();
  }

  const queuedCount = queue.filter((item) => item.status === "queued" || item.status === "error").length;

  return (
    <div className="grid gap-10">
      <section className="surface p-5 sm:p-6" aria-labelledby="upload-heading">
        <h2 id="upload-heading" className="font-display text-xl font-semibold text-white">Upload wallpapers</h2>
        <p className="mt-1 text-sm text-zinc-400">JPEG, PNG, WEBP or AVIF · up to {maxUploadMb} MB each · originals are stored untouched.</p>

        <label
          htmlFor="file-input"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition ${
            dragging ? "border-violet-400 bg-violet-500/10" : "border-white/15 hover:border-white/30"
          }`}
        >
          <span className="text-base font-medium text-white">Drop images here or tap to choose</span>
          <span className="mt-1 text-sm text-zinc-500">Select many files at once for a bulk upload</span>
          <input
            id="file-input"
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="upload-category" className="label">Category (applies to all files)</label>
            <select id="upload-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="upload-tags" className="label">Tags (comma separated)</label>
            <input id="upload-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="purple, minimal, night" className="field" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-300">
          <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="size-4 accent-violet-500" /> Publish immediately</label>
          <label className="inline-flex min-h-8 items-center gap-2"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="size-4 accent-violet-500" /> Mark as featured</label>
        </div>

        {notice && <p role="alert" className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{notice}</p>}

        {queue.length > 0 && (
          <ul className="mt-6 grid gap-2" aria-label="Upload queue">
            {queue.map((item) => (
              <li key={item.key} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-3">
                <div className="min-w-0 flex-1">
                  <label htmlFor={`title-${item.key}`} className="sr-only">Title for {item.file.name}</label>
                  <input
                    id={`title-${item.key}`}
                    value={item.title}
                    disabled={item.status === "uploading" || item.status === "done"}
                    onChange={(event) => patchItem(item.key, { title: event.target.value })}
                    maxLength={120}
                    className="field min-h-10 py-1"
                  />
                  <p className="mt-1 truncate text-xs text-zinc-500">{item.file.name} · {formatBytes(item.file.size)}</p>
                  {item.error && <p className="mt-1 text-xs text-red-300">{item.error}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.status === "done" ? "bg-emerald-500/15 text-emerald-300" : item.status === "error" ? "bg-red-500/15 text-red-300" : item.status === "uploading" ? "bg-violet-500/20 text-violet-200" : "bg-white/8 text-zinc-300"}`}>
                  {item.status === "done" ? "Uploaded" : item.status === "error" ? "Failed" : item.status === "uploading" ? "Uploading…" : "Ready"}
                </span>
                {item.status === "done" && item.wallpaperId && <Link href={`/admin/wallpapers/${item.wallpaperId}`} className="text-sm text-violet-300 hover:text-white">Edit</Link>}
                {(item.status === "queued" || item.status === "error") && !uploading && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQueue((current) => current.filter((entry) => entry.key !== item.key))}>Remove</button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" disabled={uploading || queuedCount === 0} onClick={uploadAll}>
            {uploading ? "Uploading…" : `Upload ${queuedCount || ""} ${queuedCount === 1 ? "file" : "files"}`}
          </button>
          {queue.some((item) => item.status === "done") && !uploading && (
            <button type="button" className="btn btn-ghost" onClick={() => setQueue((current) => current.filter((item) => item.status !== "done"))}>Clear finished</button>
          )}
        </div>
      </section>

      <section className="surface p-5 sm:p-6" aria-labelledby="import-heading">
        <h2 id="import-heading" className="font-display text-xl font-semibold text-white">Import from inbox folder</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          Copy images into <code className="rounded bg-white/8 px-1.5 py-0.5 text-violet-200">content/inbox/</code> on the server (use a sub-folder named after a category id, e.g. <code className="rounded bg-white/8 px-1.5 py-0.5 text-violet-200">content/inbox/nature/</code>, to assign it automatically), then press Import.
        </p>
        <p className="mt-3 text-sm text-white">
          {inboxCount === 0 ? "The inbox is empty." : `${inboxCount} image${inboxCount === 1 ? "" : "s"} waiting in the inbox.`}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="import-category" className="label">Default category</label>
            <select id="import-category" value={importCategory} onChange={(event) => setImportCategory(event.target.value)} className="field">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <label className="inline-flex min-h-11 items-center gap-2 self-end text-sm text-zinc-300"><input type="checkbox" checked={importPublish} onChange={(event) => setImportPublish(event.target.checked)} className="size-4 accent-violet-500" /> Publish immediately</label>
        </div>
        {importMessage && (
          <p role="status" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${importMessage.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>{importMessage.text}</p>
        )}
        <button type="button" className="btn btn-primary mt-5" disabled={importing || inboxCount === 0} onClick={runImport}>{importing ? "Importing…" : "Import inbox images"}</button>
      </section>
    </div>
  );
}
