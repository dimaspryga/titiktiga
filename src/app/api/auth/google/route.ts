import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { applicationUrl, optionalEnv } from "@/lib/runtime-env";

export async function GET(req: NextRequest) {
  const clientId = optionalEnv("GOOGLE_CLIENT_ID");
  if (!clientId) return NextResponse.redirect(new URL("/login?google=not-configured", req.url));
  const state = randomBytes(24).toString("hex");
  const callback = new URL("/api/auth/google/callback", applicationUrl(req.url));
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callback.toString());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  const response = NextResponse.redirect(url);
  response.cookies.set("google_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return response;
}
