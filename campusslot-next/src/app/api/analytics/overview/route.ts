// src/app/api/analytics/overview/route.ts
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const [bookings, conflicts] = await Promise.all([
      prisma.booking.findMany(),
      prisma.conflict.findMany(),
    ]);

    const active = bookings.filter((b) => !b.isDisplaced);
    const p1Count = active.filter((b) => b.priority === "P1").length;
    const p2Count = active.filter((b) => b.priority === "P2").length;
    const p3Count = active.filter((b) => b.priority === "P3").length;

    const hourCounts: Record<string, number> = {};
    for (const b of active) {
      hourCounts[b.startTime] = (hourCounts[b.startTime] ?? 0) + 1;
    }
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return ok({
      totalBookings: p1Count + p2Count + p3Count,
      p1Count,
      p2Count,
      p3Count,
      totalDisplacements: conflicts.length,
      peakHours,
    });
  } catch {
    return err("Failed to fetch analytics", "SERVER_ERROR", 500);
  }
}
