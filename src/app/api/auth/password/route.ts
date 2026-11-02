import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function PATCH(req: NextRequest) {
  const input = await req.json();
  const email = String(input.email ?? "").trim().toLowerCase();
  const passwordHash = String(input.passwordHash ?? "");
  if (!email || !passwordHash.startsWith("sha256:")) return NextResponse.json({ error: "auth.error.invalid" }, { status: 400 });
  const [result] = await pool.execute("UPDATE users SET password_hash=? WHERE email=?", [passwordHash, email]);
  return NextResponse.json({ updated: (result as any).affectedRows > 0 });
}
