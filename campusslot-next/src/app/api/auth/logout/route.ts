// src/app/api/auth/logout/route.ts
import { serializeClearCookie } from "@/lib/auth";
import { ok } from "@/lib/apiResponse";

export async function POST() {
  const response = ok({ message: "Logged out successfully" });
  response.headers.set("Set-Cookie", serializeClearCookie());
  return response;
}
