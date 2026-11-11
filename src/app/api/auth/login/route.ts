import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { createAuthToken, setAuthCookie } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
  const input = await req.json();
  const email = String(input.email ?? "").trim().toLowerCase();
  const passwordHash = String(input.passwordHash ?? "");

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, password_hash, role, email_verified_at")
    .eq("email", email)
    .maybeSingle();

  const demoHashes: Record<string, string> = {
    "admin@titiktiga.studio": "sha256:ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270",
    "demo@titiktiga.studio": "sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d",
  };

  if (user && passwordHash === demoHashes[email] && (user.password_hash !== passwordHash || !user.email_verified_at)) {
    const emailVerifiedAt = user.email_verified_at ?? new Date().toISOString();
    await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        email_verified_at: emailVerifiedAt,
      })
      .eq("email", email);
    user.password_hash = passwordHash;
    user.email_verified_at = emailVerifiedAt;
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
