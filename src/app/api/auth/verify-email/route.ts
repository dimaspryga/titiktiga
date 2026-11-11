import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { applicationUrl } from "@/lib/runtime-env";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) return NextResponse.redirect(new URL("/login?verified=invalid", applicationUrl(req.url, req.headers)));

  const hash = createHash("sha256").update(token).digest("hex");
  const now = new Date().toISOString();

  const { data: row } = await supabase
    .from("email_verification_tokens")
    .select("user_id, expires_at, used_at")
    .eq("token_hash", hash)
    .is("used_at", null)
    .gt("expires_at", now)
    .maybeSingle();

  if (!row) {
    return NextResponse.redirect(new URL("/login?verified=invalid", applicationUrl(req.url, req.headers)));
  }

  await supabase
    .from("users")
    .update({ email_verified_at: now })
    .eq("id", row.user_id);

  await supabase
    .from("email_verification_tokens")
    .update({ used_at: now })
    .eq("token_hash", hash);

  return NextResponse.redirect(new URL("/login?verified=success", applicationUrl(req.url, req.headers)));
}
