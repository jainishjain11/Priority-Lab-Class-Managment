// src/app/api/suggestions/route.ts
import { NextRequest } from "next/server";
import { findAlternativeSlots } from "@/lib/suggestionEngine";
import { ok, err } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { capacity, requiresI7, requiresGraphics, excludeLabId, excludeDay } =
      await req.json();

    if (capacity == null) {
      return err("capacity is required", "BAD_REQUEST");
    }

    const suggestions = await findAlternativeSlots({
      capacity: Number(capacity),
      requiresI7: Boolean(requiresI7),
      requiresGraphics: Boolean(requiresGraphics),
      excludeLabId,
      excludeDay,
    });

    return ok(suggestions);
  } catch {
    return err("Failed to compute suggestions", "SERVER_ERROR", 500);
  }
}
