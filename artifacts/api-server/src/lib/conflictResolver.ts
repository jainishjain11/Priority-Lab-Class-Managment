import { db } from "@workspace/db";
import { bookingsTable, conflictsTable, alertsTable, auditLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

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
  requiresI7?: boolean;
  requiresGraphics?: boolean;
}

export interface ConflictResult {
  success: boolean;
  booking?: typeof bookingsTable.$inferSelect;
  displaced?: typeof bookingsTable.$inferSelect;
  error?: string;
  message: string;
}

export async function resolveAndCreateBooking(input: BookingInput): Promise<ConflictResult> {
  const existing = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.labId, input.labId),
        eq(bookingsTable.day, input.day),
        eq(bookingsTable.isDisplaced, false)
      )
    );

  const overlapping = existing.filter((b) =>
    timesOverlap(input.startTime, input.endTime, b.startTime, b.endTime)
  );

  let displaced: typeof bookingsTable.$inferSelect | undefined;

  if (overlapping.length > 0) {
    const conflict = overlapping[0];
    const newPriority = PRIORITY_ORDER[input.priority] ?? 0;
    const existingPriority = PRIORITY_ORDER[conflict.priority] ?? 0;

    if (newPriority <= existingPriority) {
      return {
        success: false,
        error: "CONFLICT",
        message: `Cannot create booking. A ${conflict.priority} booking already exists in this slot. Your booking (${input.priority}) cannot override it.`,
      };
    }

    await db
      .update(bookingsTable)
      .set({ isDisplaced: true })
      .where(eq(bookingsTable.id, conflict.id));

    displaced = { ...conflict, isDisplaced: true };

    const alertId = randomUUID();
    await db.insert(alertsTable).values({
      id: alertId,
      bookingId: conflict.id,
      faculty: conflict.faculty,
      subject: conflict.subject,
      originalLab: conflict.labName,
      originalDay: conflict.day,
      originalStartTime: conflict.startTime,
      originalEndTime: conflict.endTime,
      reason: `Displaced by ${input.priority} booking: ${input.subject}`,
      isRead: false,
    });

    await db.insert(auditLogTable).values({
      id: randomUUID(),
      action: "Automatic Priority Override",
      description: `Displaced by ${input.priority} ${input.subject} in ${input.labName}`,
      actor: "System",
      subject: conflict.subject,
      priority: input.priority,
      labName: input.labName,
      actionType: "system",
    });
  }

  await db.insert(bookingsTable).values({
    id: input.id,
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
  });

  const newBooking = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, input.id))
    .then((r) => r[0]);

  if (displaced) {
    await db.insert(conflictsTable).values({
      id: randomUUID(),
      winningBookingId: input.id,
      displacedBookingId: displaced.id,
      resolution: `Higher priority booking (${input.priority}) automatically displaced lower priority booking (${displaced.priority}) at ${new Date().toTimeString().slice(0, 8)}`,
    });
  }

  return {
    success: true,
    booking: newBooking,
    displaced,
    message: displaced
      ? `Booking created. ${displaced.subject} has been displaced.`
      : "Booking created successfully.",
  };
}
