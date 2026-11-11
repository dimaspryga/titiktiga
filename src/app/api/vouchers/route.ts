import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function mapVoucher(r: any) {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    value: Number(r.value),
    minPurchase: Number(r.min_purchase),
    maxDiscount: r.max_discount == null || Number(r.max_discount) <= 0 ? null : Number(r.max_discount),
    startDate: r.start_date,
    expiryDate: r.expiry_date,
    usageLimit: r.usage_limit == null ? null : Number(r.usage_limit),
    usedCount: Number(r.used_count ?? 0),
    active: Boolean(r.active),
    eligibleCategories: parseJson(r.eligible_categories),
  };
}

export async function GET() {
  const { data: rows, error } = await supabase
    .from("vouchers")
    .select("*")
    .order("code", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((rows ?? []).map(mapVoucher));
}

export async function POST(req: NextRequest) {
  const input = await req.json();
  const code = String(input.code).trim().toUpperCase();

  const { data, error } = await supabase
    .from("vouchers")
    .insert({
      code,
      type: input.type,
      value: input.value,
      min_purchase: input.minPurchase ?? 0,
      max_discount: input.maxDiscount && Number(input.maxDiscount) > 0 ? Number(input.maxDiscount) : null,
      start_date: input.startDate,
      expiry_date: input.expiryDate,
      usage_limit: input.usageLimit ?? null,
      used_count: 0,
      active: input.active ?? true,
      eligible_categories: input.eligibleCategories ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Gagal menambahkan voucher" }, { status: 400 });
  }

  return NextResponse.json(mapVoucher(data), { status: 201 });
}
