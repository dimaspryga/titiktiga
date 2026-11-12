import { NextResponse } from "next/server";
import { currentAuth } from "@/lib/auth-session";

export async function GET() {
  const session = await currentAuth();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json({
    user: {
      id: session.sub,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
