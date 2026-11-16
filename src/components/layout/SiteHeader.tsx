"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { useFavorites } from "@/components/wallpaper/use-favorites";

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/categories", label: "Categories" },
  { href: "/favorites", label: "Favorites" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { ids } = useFavorites();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-void/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative rounded-full px-4 py-2 text-sm transition ${
                isActive(link.href) ? "bg-white/8 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.label}
              {link.href === "/favorites" && ids.length > 0 && (
                <span className="ml-1.5 rounded-full bg-violet-500 px-1.5 py-px text-[10px] font-bold text-white">{ids.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/explore" aria-label="Search wallpapers" className="btn btn-ghost size-11 px-0">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path strokeLinecap="round" d="m20 20-4-4" />
            </svg>
          </Link>
          <button
            type="button"
            className="btn btn-ghost size-11 px-0 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              {open ? <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-white/6 bg-void/95 px-4 pt-2 pb-5 md:hidden">
          <ul className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-base ${
                    isActive(link.href) ? "bg-white/8 text-white" : "text-zinc-300"
                  }`}
                >
                  {link.label}
                  {link.href === "/favorites" && ids.length > 0 && (
                    <span className="rounded-full bg-violet-500 px-2 py-px text-xs font-bold text-white">{ids.length}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
