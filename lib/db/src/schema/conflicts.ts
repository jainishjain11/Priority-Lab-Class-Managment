import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bookingsTable } from "./bookings";

export const conflictsTable = pgTable("conflicts", {
  id: text("id").primaryKey(),
  winningBookingId: text("winning_booking_id").notNull().references(() => bookingsTable.id),
  displacedBookingId: text("displaced_booking_id").notNull().references(() => bookingsTable.id),
  resolution: text("resolution").notNull(),
  resolvedAt: timestamp("resolved_at").defaultNow().notNull(),
});

export const insertConflictSchema = createInsertSchema(conflictsTable).omit({ resolvedAt: true });
export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type Conflict = typeof conflictsTable.$inferSelect;
