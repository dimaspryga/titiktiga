import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  const input = await req.json();
  const email = String(input.email ?? "").trim().toLowerCase();
  const passwordHash = String(input.passwordHash ?? "");

  if (!email || !passwordHash.startsWith("sha256:")) {
    return NextResponse.json({ error: "auth.error.invalid" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("email", email)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: (data?.length ?? 0) > 0 });
}
