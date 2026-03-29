// src/app/api/audit/route.ts
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    return ok(
      logs.map((l) => ({
        id: l.id,
        action: l.action,
        description: l.description,
        actor: l.actor,
        subject: l.subject,
        priority: l.priority,
        labName: l.labName,
        actionType: l.actionType,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch {
    return err("Failed to fetch audit log", "SERVER_ERROR", 500);
  }
}
