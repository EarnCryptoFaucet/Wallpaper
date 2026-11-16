import Link from "next/link";

/** Wordmark: a glowing "4K" monogram + spaced wordmark + OFFICIAL tag. */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-3 ${className}`} aria-label="4K Wallpaper Of Me – OFFICIAL, home">
      <span className="relative grid size-10 place-items-center rounded-xl border border-violet-300/30 bg-linear-to-br from-violet-500/30 to-violet-950/60 shadow-[0_0_30px_-6px_rgb(139_92_246/0.9)] transition group-hover:border-violet-200/60">
        <span className="font-display text-[15px] leading-none font-extrabold tracking-tight text-white">4K</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[13px] font-semibold tracking-[0.2em] text-white uppercase sm:text-sm">
            Wallpaper <span className="text-violet-300">Of Me</span>
          </span>
          <span className="mt-1.5 text-[9px] font-semibold tracking-[0.42em] text-zinc-400 uppercase">Official</span>
        </span>
      )}
    </Link>
  );
}
