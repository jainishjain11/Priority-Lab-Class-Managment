// src/lib/apiResponse.ts
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status });
}

export function err(message: string, code: string, status = 400): NextResponse {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}
