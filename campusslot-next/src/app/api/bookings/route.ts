// src/app/api/bookings/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveAndCreateBooking } from "@/lib/conflictEngine";
import { ok, err } from "@/lib/apiResponse";
import type { Priority } from "@/types";

function formatBooking(b: {
  id: string; subject: string; faculty: string; labId: string; labName: string;
  day: string; startTime: string; endTime: string; capacity: number; priority: string;
  isDisplaced: boolean; requiresI7: boolean; requiresGraphics: boolean; createdAt: Date;
}) {
  return {
    id: b.id,
    subject: b.subject,
    faculty: b.faculty,
    labId: b.labId,
    labName: b.labName,
    timeSlot: { day: b.day, startTime: b.startTime, endTime: b.endTime },
    capacity: b.capacity,
    priority: b.priority,
    isDisplaced: b.isDisplaced,
    requiresI7: b.requiresI7,
    requiresGraphics: b.requiresGraphics,
    createdAt: b.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const labId = searchParams.get("labId");
    const faculty = searchParams.get("faculty");

    const bookings = await prisma.booking.findMany({
      where: {
        isDisplaced: false,
        ...(labId ? { labId } : {}),
        ...(faculty ? { faculty } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(bookings.map(formatBooking));
  } catch {
    return err("Failed to fetch bookings", "SERVER_ERROR", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { subject, faculty, labId, timeSlot, capacity, priority, requiresI7, requiresGraphics } =
      await req.json();

    if (!subject || !faculty || !labId || !timeSlot || !capacity || !priority) {
      return err("Missing required fields", "BAD_REQUEST");
    }

    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab) return err("Lab not found", "NOT_FOUND", 404);
    if (lab.isUnderMaintenance) return err("Lab is under maintenance", "MAINTENANCE", 409);

    const result = await resolveAndCreateBooking({
      subject,
      faculty,
      labId,
      labName: lab.name,
      day: timeSlot.day,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      capacity,
      priority: priority as Priority,
      requiresI7,
      requiresGraphics,
    });

    if (!result.success) {
      return err(result.message, result.error ?? "CONFLICT", 409);
    }

    return ok(
      {
        booking: result.booking ? formatBooking(result.booking) : null,
        displaced: result.displaced
          ? {
              id: result.displaced.id,
              subject: result.displaced.subject,
              faculty: result.displaced.faculty,
              labId: result.displaced.labId,
              labName: result.displaced.labName,
              timeSlot: {
                day: result.displaced.day,
                startTime: result.displaced.startTime,
                endTime: result.displaced.endTime,
              },
              capacity: result.displaced.capacity,
              priority: result.displaced.priority,
              isDisplaced: true,
            }
          : null,
        message: result.message,
      },
      201
    );
  } catch {
    return err("Internal server error", "SERVER_ERROR", 500);
  }
}
