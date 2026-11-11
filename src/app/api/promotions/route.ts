import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { seedPromotions } from "@/lib/mock/site";

function parseJson(value: unknown, fallback: unknown = {}) {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
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

export async function GET() {
  const { data: initialPromotions, error } = await supabase
    .from("promotions")
    .select("*")
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let promotions = initialPromotions ?? [];
  if (!promotions.length) {
    const seedData = seedPromotions.map((promo) => ({
      placement: promo.placement,
      title: promo.title,
      code: promo.code,
      active: Boolean(promo.active),
    }));

    await supabase.from("promotions").insert(seedData);

    const recheck = await supabase.from("promotions").select("*").order("id");
    promotions = recheck.data ?? [];
  }

  return NextResponse.json(promotions.map(mapPromotion));
}

export async function POST(req: NextRequest) {
  const input = await req.json();
  const { data, error } = await supabase
    .from("promotions")
    .insert({
      placement: input.placement,
      title: input.title,
      code: input.code ?? null,
      active: input.active ?? true,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Gagal menambahkan promosi" }, { status: 400 });
  }

  return NextResponse.json(mapPromotion(data), { status: 201 });
}
