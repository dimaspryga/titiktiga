import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const AUTH_COOKIE = "titiktiga_session";
const PUBLIC_POST_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/register",
  "/api/auth/password",
  "/api/contact",
  "/api/vouchers/check",
  "/api/midtrans/notification",
  "/api/admin/database-init",
]);

function isAdminPath(pathname: string) {
  return (
    /^\/api\/(categories|customers|products|portfolio|promotions|services|testimonials|vouchers)(\/|$)/.test(pathname) ||
    pathname === "/api/content" ||
    pathname === "/api/engagement" ||
    /^\/api\/orders\/[^/]+$/.test(pathname) ||
    pathname === "/api/uploads/product-media"
  );
}

function isUserMutationPath(pathname: string) {
  return (
    pathname === "/api/orders" ||
    pathname === "/api/midtrans/token" ||
    /^\/api\/uploads\/payment-proof\/[^/]+$/.test(pathname)
  );
}

function isPrivateReadPath(pathname: string) {
  return (
    pathname === "/api/customers" ||
    pathname === "/api/orders" ||
    /^\/api\/orders\/by-number\/[^/]+$/.test(pathname)
  );
}

async function getSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  if (!secret) return { error: "Authentication is not configured", status: 503 as const };
  if (!token) return { error: "Authentication required", status: 401 as const };

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "admin" && payload.role !== "customer")
    ) {
      return { error: "Invalid session", status: 401 as const };
    }
    return { user: { sub: payload.sub, email: payload.email, role: payload.role } };
  } catch {
    return { error: "Invalid session", status: 401 as const };
  }
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return (
    (!origin || origin === request.nextUrl.origin) &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);
  const isDraftProductsRead =
    method === "GET" &&
    pathname === "/api/products" &&
    request.nextUrl.searchParams.get("includeDrafts") === "true";
  const isProtectedRead =
    method === "GET" && (isPrivateReadPath(pathname) || isDraftProductsRead);

  if (isMutation && PUBLIC_POST_PATHS.has(pathname)) {
    if (pathname !== "/api/midtrans/notification" && !isSameOrigin(request)) {
      return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (!isMutation && !isProtectedRead) {
    return NextResponse.next();
  }

  if (isMutation && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }

  const session = await getSession(request);
  if ("error" in session) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }

  const requiresAdmin =
    (isMutation && (isAdminPath(pathname) || !isUserMutationPath(pathname))) ||
    (isProtectedRead && pathname === "/api/customers") ||
    isDraftProductsRead;
  if (requiresAdmin && session.user.role !== "admin") {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }

  if (
    method === "GET" &&
    (pathname === "/api/orders" || /^\/api\/orders\/by-number\/[^/]+$/.test(pathname)) &&
    session.user.role !== "admin"
  ) {
    const requestedEmail = request.nextUrl.searchParams.get("email");
    if (requestedEmail && requestedEmail.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (pathname === "/api/orders" && !requestedEmail) {
      return NextResponse.json({ error: "An account email is required" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
