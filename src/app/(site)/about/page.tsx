import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading, PageShell } from "@/components/ui/common";

export const metadata: Metadata = {
  title: "About",
  description: "Why 4K Wallpaper Of Me – OFFICIAL exists: a premium, original-resolution wallpaper platform built around quality and simplicity.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  { title: "Original quality, always", text: "Every download is the untouched original file at its true resolution. Thumbnails and previews are only used for browsing — never for downloads." },
  { title: "Mobile first", text: "Designed for the screen in your pocket. Fast grids, comfortable tap targets and wallpapers cropped for modern phones." },
  { title: "Curated, not cluttered", text: "A focused collection organised by mood. No endless feeds, no noisy ads — the wallpapers are the focus." },
  { title: "Private by default", text: "Favorites are stored on your device. No account, no tracking of what you save." },
];

export default function AboutPage() {
  return (
    <PageShell className="pb-10">
      <PageHeading eyebrow="About" title="A home for wallpapers worth keeping" description="4K Wallpaper Of Me – OFFICIAL is the official home of a personal wallpaper collection, built for people who care how their screen looks." />
      <div className="grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map((item) => (
          <section key={item.title} className="surface p-6">
            <h2 className="font-display text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
          </section>
        ))}
      </div>
      <section className="mt-12 max-w-2xl space-y-4 text-base leading-relaxed text-zinc-400">
        <h2 className="font-display text-2xl font-semibold text-white">How it works</h2>
        <p>Browse by category, search by keyword or tag, or explore what&apos;s newest, most popular and trending. Open any wallpaper to see its resolution, aspect ratio and format, then download the original with one tap.</p>
        <p>Found something you love? Save it to your favorites to find it again later. New wallpapers are added regularly, so there&apos;s always something fresh to discover.</p>
        <p>
          Wallpapers are free for personal use as phone and desktop backgrounds. Please don&apos;t redistribute or resell them. Questions, collaboration ideas or a custom request?{" "}
          <Link href="/contact" className="text-violet-300 underline underline-offset-4 hover:text-white">Get in touch</Link>.
        </p>
      </section>
    </PageShell>
  );
}
