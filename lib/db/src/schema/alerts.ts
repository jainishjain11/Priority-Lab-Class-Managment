import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bookingsTable } from "./bookings";

export const alertsTable = pgTable("alerts", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id").notNull().references(() => bookingsTable.id),
  faculty: text("faculty").notNull(),
  subject: text("subject").notNull(),
  originalLab: text("original_lab").notNull(),
  originalDay: text("original_day").notNull(),
  originalStartTime: text("original_start_time").notNull(),
  originalEndTime: text("original_end_time").notNull(),
  reason: text("reason").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;
