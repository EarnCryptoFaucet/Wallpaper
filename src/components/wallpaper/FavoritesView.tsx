"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { EmptyState } from "@/components/ui/common";
import { WallpaperGrid } from "@/components/wallpaper/WallpaperCard";
import { useFavorites } from "@/components/wallpaper/use-favorites";
import type { WallpaperSummary } from "@/lib/wallpapers/types";

const subscribeNoop = () => () => {};
/** False during server rendering and the hydration pass, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

type LoadState = { status: "loading" } | { status: "ready"; items: WallpaperSummary[] } | { status: "error" };

export function FavoritesView() {
  const { ids, replaceAll } = useFavorites();
  const hydrated = useHydrated();
  const idsKey = ids.join(",");
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();
    fetch(`/api/wallpapers?ids=${encodeURIComponent(idsKey)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Request failed");
        return response.json() as Promise<{ items: WallpaperSummary[] }>;
      })
      .then((data) => {
        const order = new Map(idsKey.split(",").map((id, index) => [id, index]));
        const items = [...data.items].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        setState({ status: "ready", items });
        // Drop favorites whose wallpaper was deleted or unpublished so the list never has dead entries.
        if (items.length !== order.size) replaceAll(items.map((item) => item.id));
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setState({ status: "error" });
      });
    return () => controller.abort();
  }, [idsKey, replaceAll]);

  if (!hydrated) {
    return <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5" aria-busy="true" aria-label="Loading favorites">{Array.from({ length: 5 }, (_, index) => <li key={index} className="aspect-9/16 animate-pulse rounded-2xl bg-white/5" />)}</ul>;
  }
  if (ids.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Tap the heart on any wallpaper to save it here. Favorites are stored privately on this device."
        actionHref="/explore"
        actionLabel="Discover wallpapers"
      />
    );
  }
  if (state.status === "error") {
    return <EmptyState title="Couldn't load your favorites" description="Please check your connection and refresh the page." />;
  }
  if (state.status === "loading") {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5" aria-busy="true" aria-label="Loading favorites">
        {ids.slice(0, 10).map((id) => (
          <li key={id} className="aspect-9/16 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </ul>
    );
  }
  return <WallpaperGrid wallpapers={state.items} />;
}
