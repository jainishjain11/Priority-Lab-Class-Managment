// src/app/api/analytics/stats/route.ts
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const [labs, bookings, conflicts] = await Promise.all([
      prisma.lab.findMany(),
      prisma.booking.findMany({ where: { isDisplaced: false } }),
      prisma.conflict.findMany(),
    ]);

    const totalCapacity = labs.reduce((sum, l) => sum + l.capacity, 0);
    const activeLabIds = new Set(bookings.map((b) => b.labId));
    const labsInUse = activeLabIds.size;
    const occupancyPercent =
      labs.length > 0 ? Math.round((labsInUse / labs.length) * 100) : 0;
    const availableNow = labs.filter(
      (l) => !l.isUnderMaintenance && !bookings.some((b) => b.labId === l.id)
    ).length;

    return ok({
      totalLabs: labs.length,
      totalCapacity,
      occupancyPercent,
      labsInUse,
      pendingConflicts: conflicts.length,
      autoResolved: conflicts.length,
      availableNow,
    });
  } catch {
    return err("Failed to fetch stats", "SERVER_ERROR", 500);
  }
}
