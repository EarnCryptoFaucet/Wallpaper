import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getSocialLinks } from "@/lib/config";

export function SiteFooter() {
  const socials = getSocialLinks();
  return (
    <footer className="mt-24 border-t border-white/6 bg-night/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
            Premium, original-resolution wallpapers for your phone. Every download is the full-quality file — never a compressed copy.
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Social links">
              {socials.map((social) => (
                <li key={social.label}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer me" className="chip">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Discover">
          <h2 className="eyebrow">Discover</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-zinc-300">
            <li><Link href="/explore" className="hover:text-white">Explore all</Link></li>
            <li><Link href="/explore?sort=popular" className="hover:text-white">Most popular</Link></li>
            <li><Link href="/explore?featured=1" className="hover:text-white">Featured</Link></li>
            <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link href="/favorites" className="hover:text-white">My favorites</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="eyebrow">Platform</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-zinc-300">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><a href="/sitemap.xml" className="hover:text-white">Sitemap</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/6 py-5 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} 4K Wallpaper Of Me – OFFICIAL. All wallpapers are for personal use.
      </div>
    </footer>
  );
}
