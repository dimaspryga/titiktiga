import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { seedEngagement } from "@/lib/mock/engage";

export async function GET() {
  const { data } = await supabase
    .from("engagement_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  const stored = data?.content ?? {};
  const content = typeof stored === "string" ? JSON.parse(stored) : stored;

  return NextResponse.json({ ...seedEngagement, ...content });
}

export async function PATCH(req: NextRequest) {
  const patch = await req.json();

  const { data } = await supabase
    .from("engagement_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  const stored = data?.content ?? {};
  const current = typeof stored === "string" ? JSON.parse(stored) : stored;
  const content = { ...seedEngagement, ...current, ...patch };

  const { error } = await supabase
    .from("engagement_content")
    .upsert({ id: 1, content });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(content);
}
