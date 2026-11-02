import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { createAuthToken, setAuthCookie } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state || state !== req.cookies.get("google_oauth_state")?.value) {
    return NextResponse.redirect(new URL("/login?google=failed", req.url));
  }

  const callback = new URL("/api/auth/google/callback", process.env.APP_URL ?? "http://localhost:3000");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: callback.toString(),
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok || !tokens.access_token) {
    return NextResponse.redirect(new URL("/login?google=failed", req.url));
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileResponse.json();
  const email = String(profile.email ?? "").toLowerCase();
  if (!profileResponse.ok || !profile.email_verified || !email) {
    return NextResponse.redirect(new URL("/login?google=failed", req.url));
  }

  const [rows] = await pool.execute(
    "SELECT id,name,email,role FROM users WHERE email=? OR google_id=? LIMIT 1",
    [email, String(profile.sub)]
  );
  let user = (rows as any[])[0];
  if (!user) {
    const id = randomUUID();
    const name = String(profile.name ?? email.split("@")[0]);
    await pool.execute(
      "INSERT INTO users(id,name,email,password_hash,role,email_verified_at,google_id) VALUES (?,?,?,?,?,UTC_TIMESTAMP(),?)",
      [id, name, email, "", "customer", String(profile.sub)]
    );
    user = { id, name, email, role: "customer" };
  } else {
    await pool.execute(
      "UPDATE users SET google_id=?,email_verified_at=COALESCE(email_verified_at,UTC_TIMESTAMP()) WHERE id=?",
      [String(profile.sub), user.id]
    );
  }

  await setAuthCookie(await createAuthToken({ sub: user.id, name: user.name, email: user.email, role: user.role }));
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.delete("google_oauth_state");
  return response;
}
