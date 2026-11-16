"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminRequest, jsonInit } from "@/components/admin/api-client";
import { formatDate } from "@/lib/utils";

export interface MessageItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  emailed: boolean;
  createdAt: string;
}

export function MessageList({ messages }: { messages: MessageItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function setRead(id: number, isRead: boolean) {
    const result = await adminRequest(`/api/admin/messages/${id}`, jsonInit("PATCH", { isRead }));
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this message permanently?")) return;
    const result = await adminRequest(`/api/admin/messages/${id}`, jsonInit("DELETE"));
    if (!result.ok) return setError(result.error);
    router.refresh();
  }

  if (messages.length === 0) {
    return <div className="surface px-6 py-14 text-center text-zinc-400">No messages yet. Submissions from the Contact page appear here.</div>;
  }

  return (
    <div className="grid gap-3">
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      <ul className="grid gap-3">
        {messages.map((item) => (
          <li key={item.id} className={`surface p-5 ${item.isRead ? "" : "border-violet-400/40"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-white">{item.subject} {!item.isRead && <span className="ml-2 rounded-full bg-violet-500 px-2 py-px text-[10px] font-bold text-white">NEW</span>}</h2>
                <p className="mt-1 text-sm text-zinc-400">{item.name} · <a className="text-violet-300 hover:text-white" href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}>{item.email}</a> · {formatDate(item.createdAt)}{item.emailed ? " · emailed" : ""}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRead(item.id, !item.isRead)}>{item.isRead ? "Mark unread" : "Mark read"}</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">{item.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
