// src/lib/suggestionEngine.ts
// Ported from the original suggestionEngine.ts — now using Prisma
import { prisma } from "./prisma";
import type { SlotSuggestion, Lab, TimeSlot } from "@/types";
import { DAYS, TIME_SLOTS } from "@/types";

function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && e1 > s2;
}

export interface SuggestionQuery {
  capacity: number;
  requiresI7?: boolean;
  requiresGraphics?: boolean;
  excludeLabId?: string;
  excludeDay?: string;
  excludeStartTime?: string;
}

export async function findAlternativeSlots(
  query: SuggestionQuery
): Promise<SlotSuggestion[]> {
  const labs = await prisma.lab.findMany({
    where: { isUnderMaintenance: false },
  });

  const allBookings = await prisma.booking.findMany({
    where: { isDisplaced: false },
  });

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

        const labForSuggestion: Lab = {
          id: lab.id,
          name: lab.name,
          building: lab.building,
          floor: lab.floor,
          capacity: lab.capacity,
          hasI7Processors: lab.hasI7Processors,
          hasGraphicsCards: lab.hasGraphicsCards,
          isUnderMaintenance: lab.isUnderMaintenance,
          createdAt: lab.createdAt.toISOString(),
        };

        const timeSlot: TimeSlot = {
          day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        };

        suggestions.push({
          lab: labForSuggestion,
          timeSlot,
          score,
          reason: reasons.join(", ") || "Available slot",
        });
      }
    }
  }

  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, 5);
}
