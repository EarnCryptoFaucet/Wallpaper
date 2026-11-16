import type { Metadata } from "next";
import { PageHeading, PageShell } from "@/components/ui/common";
import { FavoritesView } from "@/components/wallpaper/FavoritesView";

export const metadata: Metadata = {
  title: "My Favorites",
  description: "Your saved wallpapers, stored privately on this device.",
  alternates: { canonical: "/favorites" },
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <PageShell className="pb-10">
      <PageHeading eyebrow="Saved" title="My favorites" description="Wallpapers you've saved. They live in this browser only — no account needed." />
      <FavoritesView />
    </PageShell>
  );
}
