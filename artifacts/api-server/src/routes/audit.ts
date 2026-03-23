import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { auditLogTable } from "@workspace/db";
import { ilike, eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { search, priority } = req.query as Record<string, string>;
  const logs = await db.select().from(auditLogTable);
  let filtered = logs;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.action.toLowerCase().includes(s) ||
      l.description.toLowerCase().includes(s) ||
      l.subject.toLowerCase().includes(s) ||
      l.actor.toLowerCase().includes(s)
    );
  }
  if (priority) {
    filtered = filtered.filter(l => l.priority === priority);
  }
  const entries = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(l => ({
    id: l.id,
    action: l.action,
    description: l.description,
    timestamp: l.createdAt.toISOString(),
    actor: l.actor,
    subject: l.subject,
    priority: l.priority,
    labName: l.labName,
  }));
  const p1Overrides = logs.filter(l => l.priority === "P1" && l.actionType === "system").length;
  const systemActions = logs.filter(l => l.actionType === "system").length;
  const manualActions = logs.filter(l => l.actionType === "manual").length;
  return res.json({ entries, totalEntries: logs.length, p1Overrides, systemActions, manualActions });
});

export default router;
