import { NextResponse } from "next/server";
import {
  midtransClientKey,
  midtransIsProduction,
  midtransServerKey,
  midtransSnapUrl,
} from "@/lib/runtime-env";

export async function GET() {
  const clientKey = midtransClientKey();
  const serverKey = midtransServerKey();
  const isProduction = midtransIsProduction();
  const isConfigured = Boolean(clientKey && serverKey);

  return NextResponse.json({
    isConfigured,
    clientKeyConfigured: Boolean(clientKey),
    serverKeyConfigured: Boolean(serverKey),
    clientKey: clientKey || null,
    isProduction,
    snapUrl: midtransSnapUrl(),
    environment: isProduction ? "production" : "sandbox",
  });
}

