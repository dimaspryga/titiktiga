import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) return NextResponse.redirect(new URL("/login?verified=invalid", req.url));
  const hash = createHash("sha256").update(token).digest("hex");
  const [rows] = await pool.execute("SELECT user_id FROM email_verification_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP() LIMIT 1", [hash]);
  const row = (rows as any[])[0];
  if (!row) return NextResponse.redirect(new URL("/login?verified=invalid", req.url));
  await pool.execute("UPDATE users SET email_verified_at=UTC_TIMESTAMP() WHERE id=?", [row.user_id]);
  await pool.execute("UPDATE email_verification_tokens SET used_at=UTC_TIMESTAMP() WHERE token_hash=?", [hash]);
  return NextResponse.redirect(new URL("/login?verified=success", req.url));
}
