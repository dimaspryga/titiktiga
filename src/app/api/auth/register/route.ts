import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import supabase from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const input = await req.json();
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const passwordHash = String(input.passwordHash ?? "");

  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !passwordHash.startsWith("sha256:")) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "auth.error.exists" }, { status: 409 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      name,
      email,
      password_hash: passwordHash,
      role: "customer",
      phone: "",
      email_verified_at: null,
    })
    .select()
    .single();

  if (userError || !user) {
    const rawMsg = userError?.message || "";
    if (rawMsg.toLowerCase().includes("invalid api key") || rawMsg.toLowerCase().includes("jwt")) {
      return NextResponse.json(
        { error: "Koneksi database Supabase belum terkonfigurasi. Pastikan API key sudah dimasukkan di Environment Variables Vercel." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: userError?.message ?? "Gagal mendaftar akun" }, { status: 500 });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { error: tokenError } = await supabase
    .from("email_verification_tokens")
    .insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

  if (tokenError) {
    await supabase.from("users").delete().eq("id", user.id);
    return NextResponse.json({ error: "Gagal membuat token verifikasi" }, { status: 500 });
  }

  try {
    await sendVerificationEmail(email, name, token);
  } catch (error) {
    console.error("Verification email failed", error);
    await supabase.from("email_verification_tokens").delete().eq("user_id", user.id);
    await supabase.from("users").delete().eq("id", user.id);
    return NextResponse.json({ error: "auth.error.email" }, { status: 503 });
  }

  return NextResponse.json({ pendingVerification: true, email }, { status: 201 });
}
