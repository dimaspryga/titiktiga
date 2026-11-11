import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { seedContent } from "@/lib/mock/site";

export async function GET() {
  const { data } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  const stored = data?.content ?? {};
  const c = typeof stored === "string" ? JSON.parse(stored) : stored;

  return NextResponse.json({
    ...seedContent,
    ...c,
    store: {
      ...seedContent.store,
      ...(c.store ?? {}),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const c = await req.json();

  const { error } = await supabase
    .from("site_content")
    .upsert({ id: 1, content: c });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(c);
}
