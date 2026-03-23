import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditLogTable = pgTable("audit_log", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  actor: text("actor").notNull(),
  subject: text("subject").notNull(),
  priority: text("priority").notNull(),
  labName: text("lab_name"),
  actionType: text("action_type").notNull().default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogTable).omit({ createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogTable.$inferSelect;
