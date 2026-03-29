// src/lib/conflictEngine.ts
// Ported from the original conflictResolver.ts — now using Prisma instead of Drizzle
import { prisma } from "./prisma";
import { randomUUID } from "crypto";
import type { Priority } from "@/types";

const PRIORITY_ORDER: Record<string, number> = {
  P1: 3,
  P2: 2,
  P3: 1,
};

function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && end1 > start2;
}

export interface BookingInput {
  subject: string;
  faculty: string;
  labId: string;
  labName: string;
  day: string;
  startTime: string;
  endTime: string;
  capacity: number;
  priority: Priority;
  requiresI7?: boolean;
  requiresGraphics?: boolean;
}

export interface ConflictResult {
  success: boolean;
  booking?: {
    id: string;
    subject: string;
    faculty: string;
    labId: string;
    labName: string;
    day: string;
    startTime: string;
    endTime: string;
    capacity: number;
    priority: string;
    isDisplaced: boolean;
    requiresI7: boolean;
    requiresGraphics: boolean;
    createdAt: Date;
  };
  displaced?: {
    id: string;
    subject: string;
    faculty: string;
    labId: string;
    labName: string;
    day: string;
    startTime: string;
    endTime: string;
    capacity: number;
    priority: string;
    isDisplaced: boolean;
  };
  error?: string;
  message: string;
}

export async function resolveAndCreateBooking(
  input: BookingInput
): Promise<ConflictResult> {
  // Find existing non-displaced bookings in the same lab on the same day
  const existing = await prisma.booking.findMany({
    where: {
      labId: input.labId,
      day: input.day,
      isDisplaced: false,
    },
  });

  // Check for time overlaps
  const overlapping = existing.filter((b) =>
    timesOverlap(input.startTime, input.endTime, b.startTime, b.endTime)
  );

  let displaced: (typeof existing)[0] | undefined;

  if (overlapping.length > 0) {
    const conflict = overlapping[0];
    const newPriority = PRIORITY_ORDER[input.priority] ?? 0;
    const existingPriority = PRIORITY_ORDER[conflict.priority] ?? 0;

    // New booking cannot override an equal or higher priority booking
    if (newPriority <= existingPriority) {
      return {
        success: false,
        error: "CONFLICT",
        message: `Cannot create booking. A ${conflict.priority} booking already exists in this slot. Your booking (${input.priority}) cannot override it.`,
      };
    }

    // Displace the lower-priority booking
    await prisma.booking.update({
      where: { id: conflict.id },
      data: { isDisplaced: true },
    });

    displaced = conflict;

    // Create an alert for the displaced faculty member
    await prisma.alert.create({
      data: {
        id: randomUUID(),
        bookingId: conflict.id,
        faculty: conflict.faculty,
        subject: conflict.subject,
        originalLab: conflict.labName,
        originalDay: conflict.day,
        originalStartTime: conflict.startTime,
        originalEndTime: conflict.endTime,
        reason: `Displaced by ${input.priority} booking: ${input.subject}`,
        isRead: false,
      },
    });

    // Write to audit log
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        action: "Automatic Priority Override",
        description: `Displaced by ${input.priority} ${input.subject} in ${input.labName}`,
        actor: "System",
        subject: conflict.subject,
        priority: input.priority,
        labName: input.labName,
        actionType: "system",
      },
    });
  }

  // Create the new winning booking
  const newId = randomUUID();
  const newBooking = await prisma.booking.create({
    data: {
      id: newId,
      subject: input.subject,
      faculty: input.faculty,
      labId: input.labId,
      labName: input.labName,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      capacity: input.capacity,
      priority: input.priority,
      isDisplaced: false,
      requiresI7: input.requiresI7 ?? false,
      requiresGraphics: input.requiresGraphics ?? false,
    },
  });

  // If a displacement happened, record the conflict
  if (displaced) {
    await prisma.conflict.create({
      data: {
        id: randomUUID(),
        winningBookingId: newId,
        displacedBookingId: displaced.id,
        resolution: `Higher priority booking (${input.priority}) automatically displaced lower priority booking (${displaced.priority}) at ${new Date().toTimeString().slice(0, 8)}`,
      },
    });
  }

  return {
    success: true,
    booking: newBooking,
    displaced: displaced ? { ...displaced, isDisplaced: true } : undefined,
    message: displaced
      ? `Booking created. ${displaced.subject} has been displaced.`
      : "Booking created successfully.",
  };
}
