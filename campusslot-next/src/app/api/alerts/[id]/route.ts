// src/app/api/alerts/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) return err("Alert not found", "NOT_FOUND", 404);

    await prisma.alert.update({ where: { id }, data: { isRead: true } });
    return ok({ success: true, message: "Alert marked as read" });
  } catch {
    return err("Internal server error", "SERVER_ERROR", 500);
  }
}
