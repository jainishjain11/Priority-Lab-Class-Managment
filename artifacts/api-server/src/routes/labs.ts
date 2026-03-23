import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { labsTable, auditLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const labs = await db.select().from(labsTable);
  return res.json(labs);
});

router.post("/", async (req, res) => {
  const { name, building, floor, capacity, hasI7Processors, hasGraphicsCards } = req.body;
  if (!name || !building || floor === undefined || !capacity) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "Missing required fields" });
  }
  const id = randomUUID();
  await db.insert(labsTable).values({
    id,
    name,
    building,
    floor,
    capacity,
    hasI7Processors: hasI7Processors ?? false,
    hasGraphicsCards: hasGraphicsCards ?? false,
    isUnderMaintenance: false,
  });
  const lab = await db.select().from(labsTable).where(eq(labsTable.id, id)).then(r => r[0]);
  return res.status(201).json(lab);
});

router.patch("/:labId", async (req, res) => {
  const { labId } = req.params;
  const { isUnderMaintenance, capacity, hasI7Processors, hasGraphicsCards } = req.body;
  const updates: Record<string, unknown> = {};
  if (isUnderMaintenance !== undefined) updates.isUnderMaintenance = isUnderMaintenance;
  if (capacity !== undefined) {
    updates.capacity = capacity;
    await db.insert(auditLogTable).values({
      id: randomUUID(),
      action: "Lab Capacity Update",
      description: `Updated capacity to ${capacity} seats`,
      actor: "Admin (Placement Office)",
      subject: labId,
      priority: "P3",
      labName: labId,
      actionType: "manual",
    });
  }
  if (hasI7Processors !== undefined) updates.hasI7Processors = hasI7Processors;
  if (hasGraphicsCards !== undefined) updates.hasGraphicsCards = hasGraphicsCards;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "No fields to update" });
  }
  await db.update(labsTable).set(updates).where(eq(labsTable.id, labId));
  const lab = await db.select().from(labsTable).where(eq(labsTable.id, labId)).then(r => r[0]);
  if (!lab) return res.status(404).json({ error: "NOT_FOUND", message: "Lab not found" });
  return res.json(lab);
});

export default router;
