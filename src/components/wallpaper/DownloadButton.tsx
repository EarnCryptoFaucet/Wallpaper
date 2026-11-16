"use client";

import { useEffect, useState } from "react";

export function DownloadButton({ href, label }: { href: string; label: string }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const timer = window.setTimeout(() => setStarted(false), 6000);
    return () => window.clearTimeout(timer);
  }, [started]);

  return (
    <div>
      <a href={href} download onClick={() => setStarted(true)} className="btn btn-primary btn-lg w-full">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
        </svg>
        {label}
      </a>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-center text-xs text-violet-200">
        {started ? "Download started — the original file is saving to your device." : ""}
      </p>
    </div>
  );
}
