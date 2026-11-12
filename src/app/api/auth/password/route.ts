import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { applicationUrl } from "@/lib/runtime-env";
import { sendPasswordResetEmail } from "@/lib/email";
import supabase from "@/lib/supabase";

const genericResponse = { requested: true };

export async function POST(req: NextRequest) {
  const input = await req.json().catch(() => null);
  const email = String(input?.email ?? "").trim().toLowerCase();
  const password = String(input?.password ?? "");

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json(genericResponse);
  }

  const passwordHash = await hash(password, 12);
  const token = randomBytes(32).toString("hex");
  const { error: tokenError } = await supabase
    .from("password_reset_tokens")
    .insert({
      user_id: user.id,
      token_hash: createHash("sha256").update(token).digest("hex"),
      password_hash: passwordHash,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 500 });
  }

  try {
    await sendPasswordResetEmail(email, user.name, token);
  } catch (error) {
    console.error("Password reset email failed", error);
    await supabase.from("password_reset_tokens").delete().eq("user_id", user.id).is("used_at", null);
    return NextResponse.json({ error: "auth.error.email" }, { status: 503 });
  }

  return NextResponse.json(genericResponse);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const loginUrl = new URL("/login", applicationUrl(req.url, req.headers));
  if (!token) {
    loginUrl.searchParams.set("passwordReset", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const now = new Date().toISOString();
  const { data: resetToken, error: tokenError } = await supabase
    .from("password_reset_tokens")
    .select("user_id, password_hash")
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", now)
    .maybeSingle();

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 500 });
  }
  if (!resetToken) {
    loginUrl.searchParams.set("passwordReset", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const { error: passwordError } = await supabase
    .from("users")
    .update({ password_hash: resetToken.password_hash })
    .eq("id", resetToken.user_id);

  if (passwordError) {
    return NextResponse.json({ error: passwordError.message }, { status: 500 });
  }

  const { error: usedError } = await supabase
    .from("password_reset_tokens")
    .update({ used_at: now })
    .eq("token_hash", tokenHash);

  if (usedError) {
    return NextResponse.json({ error: usedError.message }, { status: 500 });
  }

  loginUrl.searchParams.set("passwordReset", "success");
  return NextResponse.redirect(loginUrl);
}
