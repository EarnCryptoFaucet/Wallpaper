import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  const configured = isAdminConfigured();
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
      <div className="absolute top-1/4 left-1/2 size-96 -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" aria-hidden="true" />
      <div className="surface relative w-full max-w-md p-7 sm:p-9">
        <Logo />
        <h1 className="font-display mt-8 text-2xl font-semibold text-white">Admin sign in</h1>
        <p className="mt-2 mb-7 text-sm text-zinc-400">Manage wallpapers, categories and messages.</p>
        {configured ? (
          <LoginForm />
        ) : (
          <div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
            <p className="font-semibold">Admin is not configured yet.</p>
            <p className="mt-1">
              Set <code>ADMIN_PASSWORD</code> (at least 10 characters) and <code>SESSION_SECRET</code> (at least 32 characters) in your <code>.env</code> file, then restart the server. See README.md → “Admin dashboard”.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
