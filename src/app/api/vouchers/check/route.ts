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

export async function POST(req: NextRequest) {
  let input: { code?: string; subtotal?: number; categories?: string[] };
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { code, subtotal = 0, categories = [] } = input;
  if (!code || typeof code !== "string") {
    return NextResponse.json({ ok: false, error: "invalid" });
  }

  const cleanCode = code.trim().toUpperCase();
  const { data: v, error } = await supabase
    .from("vouchers")
    .select("*")
    .ilike("code", cleanCode)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!v) return NextResponse.json({ ok: false, error: "invalid" });

  const voucher = mapVoucher(v);
  if (!voucher.active) return NextResponse.json({ ok: false, error: "inactive" });

  const today = new Date().toISOString().slice(0, 10);
  const start = String(voucher.startDate).slice(0, 10);
  const end = String(voucher.expiryDate).slice(0, 10);

  if (today < start || today > end) return NextResponse.json({ ok: false, error: "expired" });
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
    return NextResponse.json({ ok: false, error: "limit" });
  }
  if (Number(subtotal) < Number(voucher.minPurchase)) {
    return NextResponse.json({ ok: false, error: "min-purchase" });
  }

  if (Array.isArray(voucher.eligibleCategories) && voucher.eligibleCategories.length > 0) {
    const eligible = voucher.eligibleCategories as string[];
    const match = categories.some((category) =>
      eligible.some((value) => value.toLowerCase() === category.toLowerCase())
    );
    if (!match) return NextResponse.json({ ok: false, error: "category" });
  }

  return NextResponse.json({ ok: true, voucher });
}
