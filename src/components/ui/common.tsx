import Link from "next/link";
import type { ReactNode } from "react";

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="max-w-2xl animate-fade-up pt-10 pb-8 sm:pt-14">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
      {description && <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">{description}</p>}
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-violet-300 hover:text-white">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="surface mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center" role="status">
      <div className="grid size-14 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-violet-200">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" rx="3" />
          <path strokeLinecap="round" d="M9 17h6" />
        </svg>
      </div>
      <h2 className="font-display mt-5 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function SearchForm({
  action = "/explore",
  defaultValue = "",
  hidden = {},
  size = "md",
  placeholder = "Search wallpapers, tags, categories…",
}: {
  action?: string;
  defaultValue?: string;
  hidden?: Record<string, string | undefined>;
  size?: "md" | "lg";
  placeholder?: string;
}) {
  return (
    <form action={action} method="get" role="search" className="relative w-full">
      <label htmlFor={`search-${size}`} className="sr-only">
        Search wallpapers
      </label>
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path strokeLinecap="round" d="m20 20-4-4" />
      </svg>
      <input
        id={`search-${size}`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={80}
        className={`field pl-12 ${size === "lg" ? "min-h-14 rounded-full pr-32 text-base" : "rounded-full pr-24"}`}
      />
      <button type="submit" className={`btn btn-primary absolute top-1/2 right-1.5 -translate-y-1/2 ${size === "lg" ? "min-h-11" : "btn-sm"}`}>
        Search
      </button>
    </form>
  );
}

export function buildHref(base: string, params: Record<string, string | number | undefined | null | false>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== false && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i += 1) pages.push(i);
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={makeHref(page - 1)} rel="prev" className="chip">
          ← Previous
        </Link>
      )}
      {pages.map((entry) => (
        <Link
          key={entry}
          href={makeHref(entry)}
          aria-current={entry === page ? "true" : undefined}
          aria-label={`Page ${entry}`}
          className={`chip min-w-10 justify-center ${entry === page ? "chip-active" : ""}`}
        >
          {entry}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={makeHref(page + 1)} rel="next" className="chip">
          Next →
        </Link>
      )}
    </nav>
  );
}
