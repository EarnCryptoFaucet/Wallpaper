"use client";

import { useFavorites } from "@/components/wallpaper/use-favorites";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 4.8 6.9 4.8c1.9 0 3.5 1 5.1 3 1.6-2 3.2-3 5.1-3 3.3 0 5.2 3.2 4.1 6.4-1.7 4.7-9.2 9.3-9.2 9.3Z" />
    </svg>
  );
}

export function FavoriteButton({ id, title, variant = "overlay" }: { id: string; title: string; variant?: "overlay" | "full" }) {
  const { has, toggle } = useFavorites();
  const active = has(id);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-pressed={active}
        className={`btn btn-lg w-full ${active ? "border border-pink-400/40 bg-pink-500/15 text-pink-100" : "btn-ghost"}`}
      >
        <span className={active ? "text-pink-300" : ""}>
          <Heart filled={active} />
        </span>
        {active ? "Saved to favorites" : "Save to favorites"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={active}
      aria-label={active ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      className={`absolute top-2 right-2 grid size-10 place-items-center rounded-full border backdrop-blur-md transition active:scale-90 ${
        active ? "border-pink-300/40 bg-pink-500/30 text-pink-100" : "border-white/15 bg-black/40 text-white/85 hover:bg-black/60"
      }`}
    >
      <Heart filled={active} />
    </button>
  );
}
