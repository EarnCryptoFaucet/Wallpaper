import { eq, sql } from "drizzle-orm";
import type { ReactNode } from "react";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  const [unread] = await db.select({ count: sql<number>`count(*)::int` }).from(contactMessages).where(eq(contactMessages.isRead, false));
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminNav unreadMessages={unread?.count ?? 0} />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
