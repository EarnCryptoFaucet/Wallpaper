import Link from "next/link";
import type { CategorySummary } from "@/lib/wallpapers/types";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="group relative isolate block aspect-4/5 overflow-hidden rounded-2xl border border-white/8 transition duration-300 hover:-translate-y-1 hover:border-violet-300/40"
      style={{ backgroundColor: category.coverColor ?? "#120f20" }}
    >
      {category.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
          width={360}
          height={450}
          className="absolute inset-0 -z-10 size-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
      <div className="flex h-full flex-col justify-end p-4">
        <h3 className="font-display text-lg font-semibold text-white">{category.name}</h3>
        <p className="mt-0.5 text-xs text-zinc-300">
          {category.count} {category.count === 1 ? "wallpaper" : "wallpapers"}
        </p>
      </div>
    </Link>
  );
}
