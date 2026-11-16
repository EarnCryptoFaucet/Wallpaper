import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/http";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(120),
  subject: z.string().trim().min(3, "Please enter a subject.").max(120),
  message: z.string().trim().min(10, "Your message is a bit short — please add more detail.").max(4000),
  website: z.string().optional(),
});

/** Optional email notification through Resend. Returns true when the provider accepted the message. */
async function sendNotificationEmail(input: { name: string; email: string; subject: string; message: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "4K Wallpaper Of Me <onboarding@resend.dev>",
        to: [to],
        reply_to: input.email,
        subject: `[Contact] ${input.subject.replace(/[\r\n]+/g, " ")}`,
        text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Request rejected.", 403);
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return jsonError("Too many messages. Please wait a few minutes and try again.", 429);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid form data.", 400);

  // Honeypot filled in → pretend success so bots learn nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const { name, email, subject, message } = parsed.data;
  const emailed = await sendNotificationEmail({ name, email, subject, message });
  await db.insert(contactMessages).values({ name, email, subject, message, emailed });
  return NextResponse.json({ ok: true });
}
