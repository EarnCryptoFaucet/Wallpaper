"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest, jsonInit } from "@/components/admin/api-client";

export function RemoveStarterButton({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    if (!window.confirm(`Delete all ${count} starter wallpapers and their files? Your own uploads are not affected.`)) return;
    setBusy(true);
    const result = await adminRequest<{ removed: number }>("/api/admin/demo", jsonInit("POST"));
    setBusy(false);
    setMessage(result.ok ? `Removed ${result.data.removed} starter wallpapers.` : result.error);
    if (result.ok) router.refresh();
  }

  return (
    <div className="surface flex flex-wrap items-center gap-4 border-amber-400/30 p-5">
      <div className="min-w-0 flex-1 basis-64">
        <p className="font-medium text-amber-100">{count} starter wallpapers are on your site</p>
        <p className="mt-1 text-sm text-zinc-400">They are generated placeholder artwork, not your collection. Remove them once you&apos;ve uploaded your own.</p>
        {message && <p role="status" className="mt-2 text-sm text-amber-200">{message}</p>}
      </div>
      <button type="button" className="btn btn-danger" disabled={busy} onClick={run}>{busy ? "Removing…" : "Remove starter wallpapers"}</button>
    </div>
  );
}
