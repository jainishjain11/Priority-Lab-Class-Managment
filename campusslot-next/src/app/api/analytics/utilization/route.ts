// src/app/api/analytics/utilization/route.ts
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const [labs, bookings] = await Promise.all([
      prisma.lab.findMany({ orderBy: { name: "asc" } }),
      prisma.booking.findMany({ where: { isDisplaced: false } }),
    ]);

    const TOTAL_SLOTS = 5 * 8; // 5 days × 8 hours

    const result = labs.map((lab) => {
      const labBookings = bookings.filter((b) => b.labId === lab.id);
      const utilizationPercent = Math.min(
        Math.round((labBookings.length / TOTAL_SLOTS) * 100),
        100
      );
      return {
        labName: lab.name,
        utilizationPercent,
        bookingCount: labBookings.length,
      };
    });

    return ok(result);
  } catch {
    return err("Failed to fetch utilization", "SERVER_ERROR", 500);
  }
}
