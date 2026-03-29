// src/app/api/labs/route.ts
import { NextRequest } from "next/server";
import { ok, err } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const labs = await prisma.lab.findMany({ orderBy: { name: "asc" } });
    return ok(
      labs.map((l: any) => ({
        id: l.id,
        name: l.name,
        building: l.building,
        floor: l.floor,
        capacity: l.capacity,
        hasI7Processors: l.hasI7Processors,
        hasGraphicsCards: l.hasGraphicsCards,
        isUnderMaintenance: l.isUnderMaintenance,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch {
    return err("Failed to fetch labs", "SERVER_ERROR", 500);
  }
}
