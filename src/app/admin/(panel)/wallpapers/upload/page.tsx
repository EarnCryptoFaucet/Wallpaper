import type { Metadata } from "next";
import { UploadManager } from "@/components/admin/UploadManager";
import { requireAdminPage } from "@/lib/auth";
import { storageConfig } from "@/lib/config";
import { scanInbox } from "@/lib/inbox";
import { listCategories } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Upload" };

export default async function AdminUploadPage() {
  await requireAdminPage();
  const [categories, inbox] = await Promise.all([listCategories({ includeEmpty: true }), scanInbox()]);
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-white">Upload</h1>
        <p className="mt-1 text-zinc-400">Add new wallpapers. Thumbnails, previews and metadata are generated automatically.</p>
      </header>
      {categories.length === 0 ? (
        <p className="surface p-6 text-zinc-300">Create at least one category first (Admin → Categories).</p>
      ) : (
        <UploadManager
          categories={categories.map(({ id, name }) => ({ id, name }))}
          maxUploadMb={Math.round(storageConfig.maxUploadBytes / 1024 / 1024)}
          inboxCount={inbox.length}
        />
      )}
    </div>
  );
}
