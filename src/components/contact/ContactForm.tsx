"use client";

import { useState, type FormEvent } from "react";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "success" } | { kind: "error"; message: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setStatus({ kind: "error", message: result.error ?? "Something went wrong. Please try again." });
        return;
      }
      form.reset();
      setStatus({ kind: "success" });
    } catch {
      setStatus({ kind: "error", message: "Network error. Please check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="surface p-8 text-center" role="status">
        <p className="font-display text-xl font-semibold text-white">Message sent — thank you!</p>
        <p className="mt-2 text-sm text-zinc-400">Your message has been delivered. You&apos;ll hear back by email if a reply is needed.</p>
        <button type="button" className="btn btn-ghost mt-6" onClick={() => setStatus({ kind: "idle" })}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface grid gap-5 p-6 sm:p-8" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">Name</label>
          <input id="contact-name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="contact-email" className="label">Email</label>
          <input id="contact-email" name="email" type="email" required maxLength={120} autoComplete="email" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="label">Subject</label>
        <input id="contact-subject" name="subject" required minLength={3} maxLength={120} className="field" />
      </div>
      <div>
        <label htmlFor="contact-message" className="label">Message</label>
        <textarea id="contact-message" name="message" required minLength={10} maxLength={4000} rows={6} className="field" />
      </div>
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="absolute -left-2499.75 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {status.kind === "error" && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {status.message}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
