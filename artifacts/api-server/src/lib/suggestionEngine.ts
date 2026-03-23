import { db } from "@workspace/db";
import { labsTable, bookingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const TIME_SLOTS = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "12:00", endTime: "13:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
  { startTime: "16:00", endTime: "17:00" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && end1 > start2;
}

export interface SuggestionQuery {
  capacity: number;
  requiresI7?: boolean;
  requiresGraphics?: boolean;
  excludeLabId?: string;
  excludeDay?: string;
  excludeStartTime?: string;
}

export interface SlotSuggestion {
  lab: typeof labsTable.$inferSelect;
  timeSlot: { day: string; startTime: string; endTime: string };
  score: number;
  reason: string;
}

export async function findAlternativeSlots(query: SuggestionQuery): Promise<SlotSuggestion[]> {
  const labs = await db.select().from(labsTable).where(eq(labsTable.isUnderMaintenance, false));
  const allBookings = await db.select().from(bookingsTable).where(eq(bookingsTable.isDisplaced, false));

  const suggestions: SlotSuggestion[] = [];

  for (const lab of labs) {
    if (lab.capacity < query.capacity) continue;
    if (query.requiresI7 && !lab.hasI7Processors) continue;
    if (query.requiresGraphics && !lab.hasGraphicsCards) continue;

    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        const isOccupied = allBookings.some(
          (b) =>
            b.labId === lab.id &&
            b.day === day &&
            timesOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime)
        );

        if (isOccupied) continue;

        let score = 70;
        const reasons: string[] = [];

        if (lab.capacity === query.capacity) {
          score += 15;
          reasons.push("Exact capacity match");
        } else if (lab.capacity > query.capacity) {
          score += 10;
          reasons.push("Sufficient capacity");
        }

        if (query.requiresI7 && lab.hasI7Processors) {
          score += 10;
          reasons.push("Has i7 processors");
        }
        if (query.requiresGraphics && lab.hasGraphicsCards) {
          score += 10;
          reasons.push("Has graphics cards");
        }

        if (day !== query.excludeDay) {
          score += 5;
          reasons.push("Different day available");
        }

        score = Math.min(score, 100);

        suggestions.push({
          lab,
          timeSlot: { day, startTime: slot.startTime, endTime: slot.endTime },
          score,
          reason: reasons.join(", ") || "Available slot",
        });
      }
    }
  }

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, 5);
}
