import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse(new Uint8Array([0, 0, 1, 0, 1, 0, 16, 16, 0, 0, 1, 0, 32, 0, 68, 0, 0, 0, 22, 0, 0, 0]), {
    headers: { "Content-Type": "image/x-icon", "Cache-Control": "public, max-age=86400" },
  });
}
