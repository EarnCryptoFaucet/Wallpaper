"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { adminRequest, jsonInit } from "@/components/admin/api-client";

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  total: number;
}

type Message = { ok: boolean; text: string } | null;

function Banner({ value }: { value: Message }) {
  if (!value) return null;
  return <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${value.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>{value.text}</p>;
}

function CategoryRow({ category }: { category: CategoryItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const result = await adminRequest(`/api/admin/categories/${category.id}`, jsonInit("PATCH", {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      sortOrder: Number.parseInt(String(form.get("sortOrder") ?? "0"), 10) || 0,
    }));
    setBusy(false);
    setMessage(result.ok ? { ok: true, text: "Saved." } : { ok: false, text: result.error });
    if (result.ok) router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete the category “${category.name}”?`)) return;
    setBusy(true);
    const result = await adminRequest(`/api/admin/categories/${category.id}`, jsonInit("DELETE"));
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: result.error });
    router.refresh();
  }

  return (
    <li className="surface p-4">
      <form onSubmit={save} className="grid gap-3 md:grid-cols-[1fr_1.5fr_6rem_auto] md:items-end">
        <div>
          <label htmlFor={`name-${category.id}`} className="label">Name</label>
          <input id={`name-${category.id}`} name="name" defaultValue={category.name} required minLength={2} maxLength={40} className="field" />
        </div>
        <div>
          <label htmlFor={`desc-${category.id}`} className="label">Description</label>
          <input id={`desc-${category.id}`} name="description" defaultValue={category.description} maxLength={200} className="field" />
        </div>
        <div>
          <label htmlFor={`order-${category.id}`} className="label">Order</label>
          <input id={`order-${category.id}`} name="sortOrder" type="number" min={0} max={9999} defaultValue={category.sortOrder} className="field" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>Save</button>
          <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={remove}>Delete</button>
        </div>
      </form>
      <p className="mt-3 text-xs text-zinc-500">
        URL: /categories/{category.id} · <Link href={`/admin/wallpapers?category=${category.id}`} className="text-violet-300 hover:text-white">{category.total} wallpaper{category.total === 1 ? "" : "s"}</Link>
      </p>
      {message && <div className="mt-3"><Banner value={message} /></div>}
    </li>
  );
}

export function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    const result = await adminRequest("/api/admin/categories", jsonInit("POST", { name: String(form.get("name") ?? ""), description: String(form.get("description") ?? "") }));
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: result.error });
    formElement.reset();
    setMessage({ ok: true, text: "Category created. It appears on the website as soon as it contains a published wallpaper." });
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={create} className="surface grid gap-4 p-5 sm:p-6" aria-labelledby="new-category">
        <h2 id="new-category" className="font-display text-xl font-semibold text-white">New category</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-name" className="label">Name</label>
            <input id="new-name" name="name" required minLength={2} maxLength={40} placeholder="e.g. Cyberpunk" className="field" />
          </div>
          <div>
            <label htmlFor="new-description" className="label">Description (optional)</label>
            <input id="new-description" name="description" maxLength={200} className="field" />
          </div>
        </div>
        <Banner value={message} />
        <div><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create category"}</button></div>
      </form>
      <ul className="grid gap-3" aria-label="Existing categories">
        {categories.map((category) => <CategoryRow key={`${category.id}-${category.name}-${category.sortOrder}`} category={category} />)}
      </ul>
    </div>
  );
}
