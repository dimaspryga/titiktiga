import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requiredEnv } from "@/lib/runtime-env";

export const AUTH_COOKIE = "titiktiga_session";

function secret() {
  return new TextEncoder().encode(requiredEnv("JWT_SECRET"));
}

export type AuthTokenPayload = {
  sub: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

export async function createAuthToken(payload: AuthTokenPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secret());
  return payload as unknown as AuthTokenPayload;
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function currentAuth(): Promise<AuthTokenPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
}
