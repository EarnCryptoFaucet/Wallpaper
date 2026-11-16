import Link from "next/link";
import { RemoveStarterButton } from "@/components/admin/RemoveStarterButton";
import { requireAdminPage } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { getAdminDashboardStats } from "@/lib/wallpapers/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const stats = await getAdminDashboardStats();
  const maxDaily = Math.max(1, ...stats.daily.map((entry) => entry.count));
  const cards = [
    { label: "Wallpapers", value: stats.totals.total, hint: `${stats.totals.published} published` },
    { label: "Total downloads", value: stats.totals.downloads, hint: "All time" },
    { label: "Featured", value: stats.totals.featured, hint: "Shown on the homepage" },
    { label: "Unread messages", value: stats.unreadMessages, hint: "From the contact form" },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-zinc-400">A quick overview of your wallpaper platform.</p>
      </header>

      {stats.totals.demo > 0 && <RemoveStarterButton count={stats.totals.demo} />}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="surface p-5">
            <dt className="text-sm text-zinc-400">{card.label}</dt>
            <dd className="font-display mt-2 text-3xl font-semibold text-white">{formatNumber(card.value)}</dd>
            <p className="mt-1 text-xs text-zinc-500">{card.hint}</p>
          </div>
        ))}
      </dl>

      <section className="surface p-5 sm:p-6" aria-labelledby="chart-title">
        <h2 id="chart-title" className="font-display text-lg font-semibold text-white">Downloads · last 14 days</h2>
        <ol className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2" aria-label="Daily downloads">
          {stats.daily.map((entry) => (
            <li key={entry.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${entry.day}: ${entry.count} downloads`}>
              <span className="text-[10px] text-zinc-500">{entry.count > 0 ? entry.count : ""}</span>
              <span className="w-full rounded-t-md bg-linear-to-t from-violet-700 to-violet-400" style={{ height: `${Math.max(4, (entry.count / maxDaily) * 100)}%`, opacity: entry.count === 0 ? 0.25 : 1 }} />
              <span className="text-[10px] text-zinc-600">{entry.day.slice(8)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="top-title">
        <h2 id="top-title" className="font-display mb-3 text-lg font-semibold text-white">Most downloaded</h2>
        {stats.top.length === 0 ? (
          <p className="text-sm text-zinc-500">No wallpapers yet.</p>
        ) : (
          <ol className="grid gap-2">
            {stats.top.map((item, index) => (
              <li key={item.id} className="surface flex items-center gap-4 p-3">
                <span className="w-6 text-center text-sm text-zinc-500">{index + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnailUrl} alt="" width={36} height={64} loading="lazy" className="h-16 w-9 rounded-md object-cover" style={{ backgroundColor: item.color }} />
                <Link href={`/admin/wallpapers/${item.id}`} className="min-w-0 flex-1 truncate font-medium text-white hover:text-violet-300">{item.title}</Link>
                <span className="text-sm text-zinc-400">{formatNumber(item.downloads)} downloads</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/wallpapers/upload" className="btn btn-primary">Upload wallpapers</Link>
        <Link href="/admin/categories" className="btn btn-ghost">Manage categories</Link>
      </div>
    </div>
  );
}
