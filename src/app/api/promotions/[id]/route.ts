import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

function parseJson(value: unknown) {
  if (typeof value !== "string") return value ?? {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function mapPromotion(r: any) {
  return {
    id: r.id,
    placement: r.placement,
    title: parseJson(r.title),
    code: r.code ?? null,
    active: Boolean(r.active),
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await req.json();
  const updates: Record<string, unknown> = {};

  if (input.placement !== undefined) updates.placement = input.placement;
  if (input.title !== undefined) updates.title = input.title;
  if (input.code !== undefined) updates.code = input.code;
  if (input.active !== undefined) updates.active = Boolean(input.active);

  const { data, error } = await supabase
    .from("promotions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Promosi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(mapPromotion(data));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(true);
}
