"use server";

import { getDb, auditLogs } from "@/lib/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/rbac";

export async function getAuditLogs(limit = 100) {
  await requireAdmin();
  const db = await getDb();
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.id))
    .limit(limit);
}
