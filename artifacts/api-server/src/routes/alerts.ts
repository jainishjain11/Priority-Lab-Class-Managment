import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const faculty = req.query.faculty as string;
  const alerts = await db.select().from(alertsTable);
  const filtered = faculty ? alerts.filter(a => a.faculty === faculty) : alerts;
  const result = filtered
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(a => ({
      id: a.id,
      bookingId: a.bookingId,
      subject: a.subject,
      originalLab: a.originalLab,
      originalSlot: {
        day: a.originalDay,
        startTime: a.originalStartTime,
        endTime: a.originalEndTime,
      },
      displacedAt: a.createdAt.toISOString(),
      reason: a.reason,
      isRead: a.isRead,
    }));
  return res.json(result);
});

export default router;
