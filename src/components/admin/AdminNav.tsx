"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { adminRequest, jsonInit } from "@/components/admin/api-client";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/wallpapers", label: "Wallpapers", exact: false },
  { href: "/admin/wallpapers/upload", label: "Upload", exact: true },
  { href: "/admin/categories", label: "Categories", exact: false },
  { href: "/admin/messages", label: "Messages", exact: false },
];

export function AdminNav({ unreadMessages }: { unreadMessages: number }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await adminRequest("/api/admin/logout", jsonInit("POST"));
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-white/8 bg-night/80 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:flex-col lg:items-start lg:gap-8 lg:p-6">
        <div>
          <Logo />
          <p className="mt-3 hidden text-xs tracking-widest text-zinc-500 uppercase lg:block">Admin dashboard</p>
        </div>
        <button type="button" onClick={logout} className="btn btn-ghost btn-sm lg:hidden">Sign out</button>
      </div>
      <nav aria-label="Admin" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href) && pathname !== "/admin/wallpapers/upload";
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 shrink-0 items-center justify-between gap-3 rounded-xl px-4 text-sm transition ${
                active ? "bg-violet-500/20 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
              {link.href === "/admin/messages" && unreadMessages > 0 && (
                <span className="rounded-full bg-violet-500 px-2 py-px text-[10px] font-bold text-white">{unreadMessages}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="hidden px-4 lg:absolute lg:bottom-6 lg:block lg:w-64">
        <Link href="/" target="_blank" className="block rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-white">View website ↗</Link>
        <button type="button" onClick={logout} className="btn btn-ghost mt-2 w-full">Sign out</button>
      </div>
    </aside>
  );
}
