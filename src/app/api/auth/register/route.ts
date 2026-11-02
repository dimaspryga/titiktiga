import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes, randomUUID } from "crypto";
import pool from "@/lib/mysql";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const input = await req.json();
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const passwordHash = String(input.passwordHash ?? "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !passwordHash.startsWith("sha256:")) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 400 });
  }
  const [existing] = await pool.execute("SELECT id FROM users WHERE email=? LIMIT 1", [email]);
  if ((existing as any[]).length) return NextResponse.json({ error: "auth.error.exists" }, { status: 409 });
  const id = randomUUID();
  await pool.execute("INSERT INTO users(id,name,email,password_hash,role,phone,email_verified_at) VALUES (?,?,?,?,'customer','',NULL)", [id, name, email, passwordHash]);
  const token = randomBytes(32).toString("hex");
  await pool.execute("INSERT INTO email_verification_tokens(id,user_id,token_hash,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 24 HOUR))", [randomUUID(), id, createHash("sha256").update(token).digest("hex")]);
  try {
    await sendVerificationEmail(email, name, token);
  } catch (error) {
    console.error("Verification email failed", error);
    await pool.execute("DELETE FROM email_verification_tokens WHERE user_id=?", [id]);
    await pool.execute("DELETE FROM users WHERE id=?", [id]);
    return NextResponse.json({ error: "auth.error.email" }, { status: 503 });
  }
  return NextResponse.json({ pendingVerification: true, email }, { status: 201 });
}
