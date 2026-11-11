import { NextRequest, NextResponse } from "next/server";
import { requiredEnv } from "@/lib/runtime-env";
import supabase from "@/lib/supabase";

export async function POST(request: NextRequest) {
  let secret: string;
  try {
    secret = requiredEnv("DB_INIT_SECRET");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "DB_INIT_SECRET belum dikonfigurasi" },
      { status: 503 }
    );
  }

  const suppliedSecret = request.headers.get("x-init-secret") ?? "";
  if (suppliedSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check Supabase connection health
    const { data, error } = await supabase.from("site_content").select("id").limit(1);
    if (error) {
      return NextResponse.json(
        {
          initialized: false,
          error: `Koneksi Supabase error: ${error.message}. Pastikan database/supabase.sql telah dijalankan di Supabase SQL Editor.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      initialized: true,
      message: "Supabase connection verified. Tables accessible.",
      sampleQuery: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Database initialization check failed",
      },
      { status: 500 }
    );
  }
}
