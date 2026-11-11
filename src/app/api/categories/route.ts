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

export async function GET() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order_index", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(mapCategory));
}

export async function POST(req: NextRequest) {
  const i = await req.json();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug: i.slug,
      name: i.name,
      description: i.description,
      image_url: i.image ?? "",
      order_index: i.order ?? 0,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Gagal menambahkan kategori" }, { status: 400 });
  }

  return NextResponse.json(mapCategory(data), { status: 201 });
}
