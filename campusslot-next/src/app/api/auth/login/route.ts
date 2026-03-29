// src/app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, serializeAuthCookie } from "@/lib/auth";
import { ok, err } from "@/lib/apiResponse";
import type { JwtPayload, UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return err("Email and password required", "BAD_REQUEST");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return err("Invalid credentials", "UNAUTHORIZED", 401);
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      department: user.department,
    };
    const token = await signToken(payload);

    const response = ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      message: "Login successful",
    });
    response.headers.set("Set-Cookie", serializeAuthCookie(token));
    return response;
  } catch (e) {
    return err("Internal server error", "SERVER_ERROR", 500);
  }
}
