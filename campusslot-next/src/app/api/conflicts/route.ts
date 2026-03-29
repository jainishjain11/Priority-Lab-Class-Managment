// src/app/api/conflicts/route.ts
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

function formatBooking(b: {
  id: string; subject: string; faculty: string; labId: string; labName: string;
  day: string; startTime: string; endTime: string; capacity: number; priority: string;
  isDisplaced: boolean; requiresI7: boolean; requiresGraphics: boolean; createdAt: Date;
}) {
  return {
    id: b.id, subject: b.subject, faculty: b.faculty, labId: b.labId, labName: b.labName,
    timeSlot: { day: b.day, startTime: b.startTime, endTime: b.endTime },
    capacity: b.capacity, priority: b.priority, isDisplaced: b.isDisplaced,
    requiresI7: b.requiresI7, requiresGraphics: b.requiresGraphics,
    createdAt: b.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const conflicts = await prisma.conflict.findMany({
      include: { winningBooking: true, displacedBooking: true },
      orderBy: { resolvedAt: "desc" },
    });

    return ok(
      conflicts.map((c) => ({
        id: c.id,
        winningBookingId: c.winningBookingId,
        displacedBookingId: c.displacedBookingId,
        resolution: c.resolution,
        resolvedAt: c.resolvedAt.toISOString(),
        winningBooking: formatBooking(c.winningBooking),
        displacedBooking: formatBooking(c.displacedBooking),
      }))
    );
  } catch {
    return err("Failed to fetch conflicts", "SERVER_ERROR", 500);
  }
}
