// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "campusslot-fallback-secret-change-me"
);

const COOKIE_NAME = "campusslot_session";

// Role-based route protection rules
const PROTECTED_ROUTES: { pattern: RegExp; allowedRoles: string[] }[] = [
  {
    pattern: /^\/conflicts/,
    allowedRoles: ["Admin", "PlacementCoordinator"],
  },
  {
    pattern: /^\/analytics/,
    allowedRoles: ["Admin", "PlacementCoordinator"],
  },
  {
    pattern: /^\/audit/,
    allowedRoles: ["Admin", "LabAssistant"],
  },
  {
    pattern: /^\/labs/,
    allowedRoles: ["Admin", "LabAssistant"],
  },
  {
    pattern: /^\/alerts/,
    allowedRoles: ["Faculty", "Admin"],
  },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // All other routes require authentication
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = (payload as { role?: string }).role;

    // Check role-specific routes
    for (const route of PROTECTED_ROUTES) {
      if (route.pattern.test(pathname)) {
        if (!userRole || !route.allowedRoles.includes(userRole)) {
          // Authorized user but wrong role → redirect to dashboard
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        break;
      }
    }

    // Redirect root to dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid/expired token
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
