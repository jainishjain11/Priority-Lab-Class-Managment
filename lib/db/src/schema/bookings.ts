import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { labsTable } from "./labs";

export const bookingsTable = pgTable("bookings", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  faculty: text("faculty").notNull(),
  labId: text("lab_id").notNull().references(() => labsTable.id),
  labName: text("lab_name").notNull(),
  day: text("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  capacity: integer("capacity").notNull(),
  priority: text("priority").notNull(),
  isDisplaced: boolean("is_displaced").notNull().default(false),
  requiresI7: boolean("requires_i7").notNull().default(false),
  requiresGraphics: boolean("requires_graphics").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
