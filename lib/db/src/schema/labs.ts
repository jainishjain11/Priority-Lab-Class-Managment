import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labsTable = pgTable("labs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  building: text("building").notNull(),
  floor: integer("floor").notNull(),
  capacity: integer("capacity").notNull(),
  hasI7Processors: boolean("has_i7_processors").notNull().default(false),
  hasGraphicsCards: boolean("has_graphics_cards").notNull().default(false),
  isUnderMaintenance: boolean("is_under_maintenance").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLabSchema = createInsertSchema(labsTable).omit({ createdAt: true });
export type InsertLab = z.infer<typeof insertLabSchema>;
export type Lab = typeof labsTable.$inferSelect;
