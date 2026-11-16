import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-6 py-16 text-center">
      <div className="absolute top-1/3 left-1/2 size-96 -translate-x-1/2 rounded-full bg-violet-700/25 blur-[120px]" aria-hidden="true" />
      <div className="relative flex flex-col items-center">
        <Logo />
        <p className="font-display mt-14 bg-linear-to-b from-white to-violet-400/40 bg-clip-text text-[7rem] leading-none font-semibold tracking-tighter text-transparent sm:text-[10rem]">404</p>
        <h1 className="font-display mt-4 text-2xl font-semibold text-white sm:text-3xl">This wallpaper drifted out of orbit</h1>
        <p className="mt-3 max-w-md text-zinc-400">The page you&apos;re looking for doesn&apos;t exist, was moved, or is no longer published.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/explore" className="btn btn-ghost">Explore wallpapers</Link>
        </div>
      </div>
    </main>
  );
}
