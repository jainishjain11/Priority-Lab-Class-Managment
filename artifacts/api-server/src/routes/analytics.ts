import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, labsTable, conflictsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/overview", async (_req, res) => {
  const bookings = await db.select().from(bookingsTable);
  const conflicts = await db.select().from(conflictsTable);
  const p1Count = bookings.filter(b => b.priority === "P1" && !b.isDisplaced).length;
  const p2Count = bookings.filter(b => b.priority === "P2" && !b.isDisplaced).length;
  const p3Count = bookings.filter(b => b.priority === "P3" && !b.isDisplaced).length;
  const hourCounts: Record<string, number> = {};
  for (const b of bookings.filter(b => !b.isDisplaced)) {
    const hour = b.startTime;
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  }
  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
  return res.json({
    totalBookings: p1Count + p2Count + p3Count,
    p1Count,
    p2Count,
    p3Count,
    totalDisplacements: conflicts.length,
    peakHours,
  });
});

router.get("/utilization", async (_req, res) => {
  const labs = await db.select().from(labsTable);
  const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.isDisplaced, false));
  const result = labs.map(lab => {
    const labBookings = bookings.filter(b => b.labId === lab.id);
    const totalSlots = 5 * 8;
    const utilizationPercent = Math.round((labBookings.length / totalSlots) * 100);
    return {
      labName: lab.name,
      utilizationPercent: Math.min(utilizationPercent, 100),
      bookingCount: labBookings.length,
    };
  });
  return res.json(result);
});

router.get("/stats", async (_req, res) => {
  const labs = await db.select().from(labsTable);
  const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.isDisplaced, false));
  const conflicts = await db.select().from(conflictsTable);
  const totalCapacity = labs.reduce((sum, l) => sum + l.capacity, 0);
  const activeLabIds = new Set(bookings.map(b => b.labId));
  const labsInUse = activeLabIds.size;
  const occupancyPercent = labs.length > 0 ? Math.round((labsInUse / labs.length) * 100) : 0;
  const availableNow = labs.filter(l => !l.isUnderMaintenance && !bookings.some(b => b.labId === l.id)).length;
  return res.json({
    totalLabs: labs.length,
    totalCapacity,
    occupancyPercent,
    labsInUse,
    pendingConflicts: conflicts.length,
    autoResolved: conflicts.length,
    availableNow,
  });
});

export default router;
