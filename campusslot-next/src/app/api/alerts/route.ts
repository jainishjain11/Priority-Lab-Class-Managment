// src/app/api/alerts/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("campusslot_session")?.value;
    const session = token ? await verifyToken(token) : null;
    const faculty = session?.name;

    const alerts = await prisma.alert.findMany({
      where: faculty ? { faculty } : {},
      orderBy: { createdAt: "desc" },
    });

    return ok(
      alerts.map((a) => ({
        id: a.id,
        bookingId: a.bookingId,
        faculty: a.faculty,
        subject: a.subject,
        originalLab: a.originalLab,
        originalDay: a.originalDay,
        originalStartTime: a.originalStartTime,
        originalEndTime: a.originalEndTime,
        reason: a.reason,
        isRead: a.isRead,
        createdAt: a.createdAt.toISOString(),
      }))
    );
  } catch {
    return err("Failed to fetch alerts", "SERVER_ERROR", 500);
  }
}
