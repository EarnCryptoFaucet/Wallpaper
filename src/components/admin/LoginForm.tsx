"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { adminRequest, jsonInit } from "@/components/admin/api-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    const result = await adminRequest("/api/admin/login", jsonInit("POST", { username: data.get("username"), password: data.get("password") }));
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <label htmlFor="username" className="label">Username</label>
        <input id="username" name="username" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary btn-lg">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
