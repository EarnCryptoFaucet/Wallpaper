import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, SectionHeading } from "@/components/ui/common";
import { DownloadButton } from "@/components/wallpaper/DownloadButton";
import { FavoriteButton } from "@/components/wallpaper/FavoriteButton";
import { WallpaperGrid, wallpaperAlt } from "@/components/wallpaper/WallpaperCard";
import { siteConfig } from "@/lib/config";
import { formatBytes, formatDate, formatNumber, jsonLdScript } from "@/lib/utils";
import { getRelatedWallpapers, getWallpaperDetail } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const wallpaper = await getWallpaperDetail(id);
  if (!wallpaper) return { title: "Wallpaper not found", robots: { index: false } };
  const description =
    wallpaper.description.slice(0, 155) ||
    `Download “${wallpaper.title}”, a ${wallpaper.categoryName.toLowerCase()} ${wallpaper.quality} phone wallpaper (${wallpaper.resolution}) in original quality.`;
  const title = `${wallpaper.title} — ${wallpaper.categoryName} ${wallpaper.quality} Wallpaper`;
  return {
    title,
    description,
    keywords: wallpaper.tags,
    alternates: { canonical: `/wallpaper/${wallpaper.id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/wallpaper/${wallpaper.id}`,
      images: [{ url: wallpaper.previewUrl, alt: wallpaperAlt(wallpaper) }],
    },
    twitter: { card: "summary_large_image", title, description, images: [wallpaper.previewUrl] },
  };
}

export default async function WallpaperPage({ params }: Props) {
  const { id } = await params;
  const wallpaper = await getWallpaperDetail(id);
  if (!wallpaper) notFound();
  const related = await getRelatedWallpapers(wallpaper, 8);

  const specs: Array<[string, string]> = [
    ["Resolution", `${wallpaper.resolution} px`],
    ["Quality", wallpaper.quality],
    ["Aspect ratio", wallpaper.aspectRatio],
    ["File format", wallpaper.format.toUpperCase()],
    ["File size", formatBytes(wallpaper.fileSize)],
    ["Downloads", formatNumber(wallpaper.downloads)],
    ["Published", formatDate(wallpaper.publishedAt)],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: wallpaper.title,
    description: wallpaper.description || undefined,
    contentUrl: `${siteConfig.url}${wallpaper.previewUrl}`,
    thumbnailUrl: `${siteConfig.url}${wallpaper.thumbnailUrl}`,
    url: `${siteConfig.url}/wallpaper/${wallpaper.id}`,
    width: wallpaper.width,
    height: wallpaper.height,
    encodingFormat: `image/${wallpaper.format === "jpg" ? "jpeg" : wallpaper.format}`,
    datePublished: wallpaper.publishedAt,
    keywords: wallpaper.tags.join(", "),
    genre: wallpaper.categoryName,
    creator: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <PageShell className="pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-zinc-500">
        <Link href="/explore" className="hover:text-white">Explore</Link> <span aria-hidden="true">/</span>{" "}
        <Link href={`/categories/${wallpaper.categoryId}`} className="hover:text-white">{wallpaper.categoryName}</Link>{" "}
        <span aria-hidden="true">/</span> <span className="text-zinc-300">{wallpaper.title}</span>
      </nav>

      <article className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <div className="relative flex justify-center lg:sticky lg:top-24 lg:self-start">
          <div className="absolute inset-x-0 top-1/4 mx-auto size-72 rounded-full opacity-40 blur-[100px]" style={{ backgroundColor: wallpaper.color }} aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)]" style={{ backgroundColor: wallpaper.color }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={wallpaper.previewUrl}
              alt={wallpaperAlt(wallpaper)}
              width={wallpaper.width}
              height={wallpaper.height}
              fetchPriority="high"
              decoding="async"
              className="block h-auto max-h-[78vh] w-auto max-w-full"
              style={{ aspectRatio: `${wallpaper.width} / ${wallpaper.height}` }}
            />
          </div>
        </div>

        <div className="animate-fade-up">
          <Link href={`/categories/${wallpaper.categoryId}`} className="chip chip-active">{wallpaper.categoryName}</Link>
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{wallpaper.title}</h1>
          {wallpaper.description && <p className="mt-4 text-base leading-relaxed text-zinc-400">{wallpaper.description}</p>}

          <div className="mt-8 grid gap-3">
            <DownloadButton href={wallpaper.downloadUrl} label={`Download original · ${wallpaper.resolution}`} />
            <FavoriteButton id={wallpaper.id} title={wallpaper.title} variant="full" />
            <a href={wallpaper.originalUrl} target="_blank" rel="noopener noreferrer" className="text-center text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline">
              View full-resolution image in a new tab
            </a>
          </div>

          <section aria-labelledby="details-heading" className="surface mt-8 p-5">
            <h2 id="details-heading" className="eyebrow">Image details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              {specs.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-zinc-500">{label}</dt>
                  <dd className="mt-0.5 font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {wallpaper.tags.length > 0 && (
            <section aria-labelledby="tags-heading" className="mt-6">
              <h2 id="tags-heading" className="eyebrow">Tags</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {wallpaper.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/explore?q=${encodeURIComponent(tag)}`} className="chip">#{tag}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related-heading">
          <SectionHeading eyebrow="You may also like" title="Related wallpapers" href={`/categories/${wallpaper.categoryId}`} linkLabel={`More ${wallpaper.categoryName}`} />
          <WallpaperGrid wallpapers={related} />
        </section>
      )}
    </PageShell>
  );
}
