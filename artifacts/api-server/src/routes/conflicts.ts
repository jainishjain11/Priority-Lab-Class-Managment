import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conflictsTable, bookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const conflicts = await db.select().from(conflictsTable);
  const result = await Promise.all(
    conflicts.map(async (c) => {
      const winning = await db.select().from(bookingsTable).where(eq(bookingsTable.id, c.winningBookingId)).then(r => r[0]);
      const displaced = await db.select().from(bookingsTable).where(eq(bookingsTable.id, c.displacedBookingId)).then(r => r[0]);
      if (!winning || !displaced) return null;
      return {
        id: c.id,
        resolvedAt: c.resolvedAt.toISOString(),
        resolution: c.resolution,
        winningBooking: {
          id: winning.id,
          subject: winning.subject,
          faculty: winning.faculty,
          labName: winning.labName,
          labId: winning.labId,
          timeSlot: { day: winning.day, startTime: winning.startTime, endTime: winning.endTime },
          capacity: winning.capacity,
          priority: winning.priority,
          isDisplaced: winning.isDisplaced,
          createdAt: winning.createdAt.toISOString(),
        },
        displacedBooking: {
          id: displaced.id,
          subject: displaced.subject,
          faculty: displaced.faculty,
          labName: displaced.labName,
          labId: displaced.labId,
          timeSlot: { day: displaced.day, startTime: displaced.startTime, endTime: displaced.endTime },
          capacity: displaced.capacity,
          priority: displaced.priority,
          isDisplaced: true,
          createdAt: displaced.createdAt.toISOString(),
        },
      };
    })
  );
  return res.json(result.filter(Boolean).reverse());
});

export default router;
