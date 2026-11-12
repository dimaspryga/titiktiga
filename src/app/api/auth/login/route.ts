import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { compare, hash } from "bcryptjs";
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
  const input = await req.json().catch(() => null);
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 400 });
  }
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const legacyPasswordHash = `sha256:${createHash("sha256").update(password).digest("hex")}`;
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 400 });
  }

  // 1. Coba cari di database Supabase
  const { data: initialUser, error: lookupError } = await supabase
    .from("users")
    .select("id, name, email, password_hash, role, email_verified_at")
    .eq("email", email)
    .maybeSingle();
  let user = initialUser;

  const demoCredentialsEnabled =
    process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_ACCOUNTS === "true";
  const isDefaultDemoCredential = Object.values(DEMO_USERS).some(
    (account) => account.passwordHash === legacyPasswordHash
  );
  if (!demoCredentialsEnabled && isDefaultDemoCredential) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 401 });
  }

  const demoConfig = demoCredentialsEnabled ? DEMO_USERS[email] : undefined;
  const isDemoLogin =
    Boolean(demoConfig) &&
    legacyPasswordHash === demoConfig?.passwordHash &&
    (!user || user.password_hash === demoConfig.passwordHash);
  if (lookupError && !isDemoLogin) {
    return NextResponse.json(
      { error: "Database akun sedang tidak dapat diakses." },
      { status: 503 }
    );
  }

  if (isDemoLogin && demoConfig) {
    const emailVerifiedAt = user?.email_verified_at ?? new Date().toISOString();
    if (!user) {
      const { error: demoUserError } = await supabase.from("users").upsert({
        id: demoConfig.id,
        name: demoConfig.name,
        email: demoConfig.email,
        password_hash: demoConfig.passwordHash,
        role: demoConfig.role,
        email_verified_at: emailVerifiedAt,
      });
      if (demoUserError) console.error("Demo account bootstrap failed", demoUserError);
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

  if (!user) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 401 });
  }

  const storedPasswordHash = String(user.password_hash ?? "");
  const isLegacyHash = storedPasswordHash.startsWith("sha256:");
  let validPassword = false;
  if (isLegacyHash) {
    const storedHashBytes = Buffer.from(storedPasswordHash);
    const suppliedHashBytes = Buffer.from(legacyPasswordHash);
    validPassword =
      storedHashBytes.length === suppliedHashBytes.length &&
      timingSafeEqual(storedHashBytes, suppliedHashBytes);
  } else if (/^\$2[aby]\$/.test(storedPasswordHash)) {
    validPassword = await compare(password, storedPasswordHash);
  }
  if (!validPassword) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 401 });
  }

  if (!user.email_verified_at) {
    return NextResponse.json({ error: "auth.error.unverified" }, { status: 403 });
  }

  if (isLegacyHash && !isDemoLogin) {
    const upgradedHash = await hash(password, 12);
    const { error: upgradeError } = await supabase
      .from("users")
      .update({ password_hash: upgradedHash })
      .eq("id", user.id);
    if (upgradeError) {
      return NextResponse.json({ error: "Database akun sedang tidak dapat diakses." }, { status: 503 });
    }
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  await setAuthCookie(await createAuthToken({ sub: user.id, name: user.name, email: user.email, role: user.role }));

  return NextResponse.json({ user: sessionUser });
}
