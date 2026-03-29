// src/app/api/bookings/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return err("Booking not found", "NOT_FOUND", 404);

    await prisma.booking.update({
      where: { id },
      data: { isDisplaced: true },
    });

    return ok({ success: true, message: "Booking deleted successfully" });
  } catch {
    return err("Internal server error", "SERVER_ERROR", 500);
  }
}
