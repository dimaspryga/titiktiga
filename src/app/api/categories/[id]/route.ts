import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

function parseJson(value: unknown, fallback: unknown = "") {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return value || fallback;
  }
}

function mapCategory(r: any) {
  return {
    id: r.id,
    slug: r.slug,
    name: parseJson(r.name, { id: "", en: "" }),
    description: parseJson(r.description, { id: "", en: "" }),
    image: r.image_url ?? "",
    order: r.order_index ?? 0,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await req.json();
  const updates: Record<string, unknown> = {};

  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.image !== undefined) updates.image_url = input.image;
  if (input.order !== undefined) updates.order_index = input.order;

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Kategori tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(mapCategory(data));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(true);
}
