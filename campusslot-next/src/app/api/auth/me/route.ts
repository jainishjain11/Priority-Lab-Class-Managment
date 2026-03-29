// src/app/api/auth/me/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { ok, err } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("campusslot_session")?.value;
    if (!token) return err("Not authenticated", "UNAUTHORIZED", 401);

    const payload = await verifyToken(token);
    if (!payload) return err("Invalid token", "UNAUTHORIZED", 401);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, department: true, registrationNumber: true },
    });
    if (!user) return err("User not found", "NOT_FOUND", 404);

    return ok(user);
  } catch {
    return err("Internal server error", "SERVER_ERROR", 500);
  }
}
