import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { MessageList } from "@/components/admin/MessageList";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  await requireAdminPage();
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-white">Messages</h1>
        <p className="mt-1 text-zinc-400">Everything sent through the Contact page is stored here, even if email delivery is not configured.</p>
      </header>
      <MessageList messages={rows.map((row) => ({ id: row.id, name: row.name, email: row.email, subject: row.subject, message: row.message, isRead: row.isRead, emailed: row.emailed, createdAt: row.createdAt.toISOString() }))} />
    </div>
  );
}
