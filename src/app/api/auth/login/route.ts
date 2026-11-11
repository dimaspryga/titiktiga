import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import supabase from "@/lib/supabase";
import { createAuthToken, setAuthCookie } from "@/lib/auth-session";

const DEMO_USERS: Record<string, { id: string; name: string; email: string; role: "admin" | "customer"; passwordHash: string }> = {
  "admin@titiktiga.studio": {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Administrator",
    email: "admin@titiktiga.studio",
    role: "admin",
    passwordHash: "sha256:ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270", // admin1234
  },
  "demo@titiktiga.studio": {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Demo Customer",
    email: "demo@titiktiga.studio",
    role: "customer",
    passwordHash: "sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d", // demo1234
  },
};

export async function POST(req: NextRequest) {
  const input = await req.json();
  const email = String(input.email ?? "").trim().toLowerCase();
  let passwordHash = String(input.passwordHash ?? "");

  // Fallback if plain password was sent
  if (!passwordHash && input.password) {
    passwordHash = "sha256:" + crypto.createHash("sha256").update(String(input.password)).digest("hex");
  }

  // 1. Coba cari di database Supabase
  let { data: user } = await supabase
    .from("users")
    .select("id, name, email, password_hash, role, email_verified_at")
    .eq("email", email)
    .maybeSingle();

  // 2. Dukungan otomatis akun demo: jika password cocok, pastikan user ada & terverifikasi
  const demoConfig = DEMO_USERS[email];
  if (demoConfig && passwordHash === demoConfig.passwordHash) {
    const emailVerifiedAt = user?.email_verified_at ?? new Date().toISOString();
    try {
      await supabase.from("users").upsert({
        id: user?.id ?? demoConfig.id,
        name: user?.name ?? demoConfig.name,
        email: demoConfig.email,
        password_hash: demoConfig.passwordHash,
        role: demoConfig.role,
        email_verified_at: emailVerifiedAt,
      });
    } catch {
      // Abaikan jika Supabase sedang offline atau unconfigured saat login demo
    }

    user = {
      id: user?.id ?? demoConfig.id,
      name: user?.name ?? demoConfig.name,
      email: demoConfig.email,
      password_hash: demoConfig.passwordHash,
      role: (user?.role as "admin" | "customer") ?? demoConfig.role,
      email_verified_at: emailVerifiedAt,
    };
  }

  if (!user || user.password_hash !== passwordHash) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 401 });
  }

  if (!user.email_verified_at) {
    return NextResponse.json({ error: "auth.error.unverified" }, { status: 403 });
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  await setAuthCookie(await createAuthToken({ sub: user.id, name: user.name, email: user.email, role: user.role }));

  return NextResponse.json({ user: sessionUser });
}
