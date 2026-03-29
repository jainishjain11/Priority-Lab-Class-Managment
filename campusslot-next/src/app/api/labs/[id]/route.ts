// src/app/api/labs/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const lab = await prisma.lab.findUnique({ where: { id } });
    if (!lab) return err("Lab not found", "NOT_FOUND", 404);

    const updated = await prisma.lab.update({
      where: { id },
      data: {
        ...(body.isUnderMaintenance !== undefined && {
          isUnderMaintenance: body.isUnderMaintenance,
        }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.hasI7Processors !== undefined && {
          hasI7Processors: body.hasI7Processors,
        }),
        ...(body.hasGraphicsCards !== undefined && {
          hasGraphicsCards: body.hasGraphicsCards,
        }),
      },
    });

    return ok({
      id: updated.id,
      name: updated.name,
      building: updated.building,
      floor: updated.floor,
      capacity: updated.capacity,
      hasI7Processors: updated.hasI7Processors,
      hasGraphicsCards: updated.hasGraphicsCards,
      isUnderMaintenance: updated.isUnderMaintenance,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch {
    return err("Internal server error", "SERVER_ERROR", 500);
  }
}
