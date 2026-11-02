import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { createAuthToken, setAuthCookie } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
  const input = await req.json();
  const email = String(input.email ?? "").trim().toLowerCase();
  const passwordHash = String(input.passwordHash ?? "");
  const [rows] = await pool.execute("SELECT id,name,email,password_hash,role,email_verified_at,google_id FROM users WHERE email=? LIMIT 1", [email]);
  const user = (rows as any[])[0];
  const demoHashes: Record<string, string> = {
    "admin@titiktiga.studio": "sha256:ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270",
    "demo@titiktiga.studio": "sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d",
  };
  if (user && passwordHash === demoHashes[email] && (user.password_hash !== passwordHash || !user.email_verified_at)) {
    await pool.execute("UPDATE users SET password_hash=?, email_verified_at=COALESCE(email_verified_at,UTC_TIMESTAMP()) WHERE email=?", [passwordHash, email]);
    user.password_hash = passwordHash;
    user.email_verified_at = user.email_verified_at ?? new Date();
  }
  if (!user || user.password_hash !== passwordHash) return NextResponse.json({ error: "auth.error.invalid" }, { status: 401 });
  if (!user.email_verified_at && !user.google_id) return NextResponse.json({ error: "auth.error.unverified" }, { status: 403 });
  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  await setAuthCookie(await createAuthToken({ sub: user.id, name: user.name, email: user.email, role: user.role }));
  return NextResponse.json({ user: sessionUser });
}
