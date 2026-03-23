import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, labsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { resolveAndCreateBooking } from "../lib/conflictResolver.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { labId, faculty } = req.query as Record<string, string>;
  const conditions = [eq(bookingsTable.isDisplaced, false)];
  if (labId) conditions.push(eq(bookingsTable.labId, labId));
  if (faculty) conditions.push(eq(bookingsTable.faculty, faculty));
  const bookings = await db.select().from(bookingsTable).where(and(...conditions));
  const result = bookings.map((b) => ({
    id: b.id,
    subject: b.subject,
    faculty: b.faculty,
    labName: b.labName,
    labId: b.labId,
    timeSlot: { day: b.day, startTime: b.startTime, endTime: b.endTime },
    capacity: b.capacity,
    priority: b.priority,
    isDisplaced: b.isDisplaced,
    createdAt: b.createdAt.toISOString(),
  }));
  return res.json(result);
});

router.post("/", async (req, res) => {
  const { subject, faculty, labId, timeSlot, capacity, priority, requiresI7, requiresGraphics } = req.body;
  if (!subject || !faculty || !labId || !timeSlot || !capacity || !priority) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "Missing required fields" });
  }
  const labs = await db.select().from(labsTable).where(eq(labsTable.id, labId));
  const lab = labs[0];
  if (!lab) return res.status(404).json({ error: "NOT_FOUND", message: "Lab not found" });
  if (lab.isUnderMaintenance) {
    return res.status(409).json({ error: "MAINTENANCE", message: "Lab is under maintenance" });
  }
  const id = randomUUID();
  const result = await resolveAndCreateBooking({
    id,
    subject,
    faculty,
    labId,
    labName: lab.name,
    day: timeSlot.day,
    startTime: timeSlot.startTime,
    endTime: timeSlot.endTime,
    capacity,
    priority,
    requiresI7,
    requiresGraphics,
  });
  if (!result.success) {
    return res.status(409).json({ error: result.error, message: result.message });
  }
  const booking = result.booking!;
  return res.status(201).json({
    booking: {
      id: booking.id,
      subject: booking.subject,
      faculty: booking.faculty,
      labName: booking.labName,
      labId: booking.labId,
      timeSlot: { day: booking.day, startTime: booking.startTime, endTime: booking.endTime },
      capacity: booking.capacity,
      priority: booking.priority,
      isDisplaced: booking.isDisplaced,
      createdAt: booking.createdAt.toISOString(),
    },
    displaced: result.displaced
      ? {
          id: result.displaced.id,
          subject: result.displaced.subject,
          faculty: result.displaced.faculty,
          labName: result.displaced.labName,
          labId: result.displaced.labId,
          timeSlot: {
            day: result.displaced.day,
            startTime: result.displaced.startTime,
            endTime: result.displaced.endTime,
          },
          capacity: result.displaced.capacity,
          priority: result.displaced.priority,
          isDisplaced: true,
          createdAt: result.displaced.createdAt.toISOString(),
        }
      : undefined,
    message: result.message,
  });
});

router.post("/bulk", async (req, res) => {
  const { bookings: bookingInputs } = req.body;
  if (!Array.isArray(bookingInputs)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "bookings must be an array" });
  }
  const created = [];
  const displaced = [];
  const errors = [];
  for (const input of bookingInputs) {
    const { subject, faculty, labId, timeSlot, capacity, priority, requiresI7, requiresGraphics } = input;
    const labs = await db.select().from(labsTable).where(eq(labsTable.id, labId));
    const lab = labs[0];
    if (!lab) { errors.push(`Lab ${labId} not found`); continue; }
    const id = randomUUID();
    const result = await resolveAndCreateBooking({
      id, subject, faculty, labId, labName: lab.name,
      day: timeSlot.day, startTime: timeSlot.startTime, endTime: timeSlot.endTime,
      capacity, priority, requiresI7, requiresGraphics,
    });
    if (!result.success) { errors.push(`${subject}: ${result.message}`); continue; }
    created.push(result.booking!);
    if (result.displaced) displaced.push(result.displaced);
  }
  return res.status(201).json({ created, displaced, errors });
});

router.delete("/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  await db.update(bookingsTable).set({ isDisplaced: true }).where(eq(bookingsTable.id, bookingId));
  return res.json({ success: true, message: "Booking deleted" });
});

export default router;
