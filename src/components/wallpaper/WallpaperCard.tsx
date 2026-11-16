import Link from "next/link";
import { FavoriteButton } from "@/components/wallpaper/FavoriteButton";
import type { WallpaperSummary } from "@/lib/wallpapers/types";

export function wallpaperAlt(wallpaper: Pick<WallpaperSummary, "title" | "categoryName" | "resolution">): string {
  return `${wallpaper.title} — ${wallpaper.categoryName} phone wallpaper, ${wallpaper.resolution}`;
}

export function WallpaperCard({ wallpaper, priority = false }: { wallpaper: WallpaperSummary; priority?: boolean }) {
  return (
    <article className="group relative">
      <Link
        href={`/wallpaper/${wallpaper.id}`}
        className="relative block aspect-9/16 overflow-hidden rounded-2xl border border-white/8 transition duration-300 hover:-translate-y-1 hover:border-violet-300/40 hover:shadow-[0_20px_50px_-20px_rgb(139_92_246/0.6)]"
        style={{ backgroundColor: wallpaper.color }}
        aria-label={`${wallpaper.title}, ${wallpaper.categoryName}, ${wallpaper.resolution}`}
      >
        {/* Plain <img>: thumbnails are already optimised WebP served by /media with immutable caching. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wallpaper.thumbnailUrl}
          alt={wallpaperAlt(wallpaper)}
          width={Math.round(wallpaper.width / 4)}
          height={Math.round(wallpaper.height / 4)}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-3 pt-12">
          <p className="truncate text-sm font-semibold text-white">{wallpaper.title}</p>
          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-300">
            <span className="rounded bg-white/15 px-1.5 py-px font-semibold text-white">{wallpaper.quality}</span>
            <span className="truncate">{wallpaper.categoryName}</span>
          </p>
        </div>
      </Link>
      <FavoriteButton id={wallpaper.id} title={wallpaper.title} />
    </article>
  );
}

export function WallpaperGrid({ wallpapers, priorityCount = 0 }: { wallpapers: WallpaperSummary[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {wallpapers.map((wallpaper, index) => (
        <li key={wallpaper.id}>
          <WallpaperCard wallpaper={wallpaper} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

/** Horizontal, swipeable strip used for featured / popular collections. */
export function WallpaperRail({ wallpapers, label }: { wallpapers: WallpaperSummary[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:px-0"
    >
      {wallpapers.map((wallpaper) => (
        <li key={wallpaper.id} className="w-[42vw] max-w-56 shrink-0 snap-start sm:w-48 lg:w-56">
          <WallpaperCard wallpaper={wallpaper} />
        </li>
      ))}
    </ul>
  );
}
