// src/app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, serializeAuthCookie } from "@/lib/auth";
import { ok, err } from "@/lib/apiResponse";
import { randomUUID } from "crypto";
import type { JwtPayload, UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, department, registrationNumber } =
      await req.json();

    if (!name || !email || !password || !role || !department) {
      return err("All required fields must be provided", "BAD_REQUEST");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return err("Email already registered", "DUPLICATE");
    }

    const id = randomUUID();
    const user = await prisma.user.create({
      data: { id, name, email, password, role, department, registrationNumber },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      department: user.department,
    };
    const token = await signToken(payload);

    const response = ok(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
        message: "Registration successful",
      },
      201
    );
    response.headers.set("Set-Cookie", serializeAuthCookie(token));
    return response;
  } catch (e) {
    return err("Internal server error", "SERVER_ERROR", 500);
  }
}
