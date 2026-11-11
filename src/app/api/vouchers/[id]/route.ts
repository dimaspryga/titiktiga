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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "check") return NextResponse.json({ error: "Endpoint voucher tidak ditemukan" }, { status: 404 });

  let input: { code?: string; subtotal?: number; categories?: string[] };
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" });
  }

  const { code, subtotal = 0, categories = [] } = input;
  const uppercaseCode = String(code ?? "").trim().toUpperCase();

  const { data: voucher } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", uppercaseCode)
    .maybeSingle();

  if (!voucher) return NextResponse.json({ ok: false, error: "invalid" });
  if (!Boolean(voucher.active)) return NextResponse.json({ ok: false, error: "inactive" });

  const today = new Date().toISOString().slice(0, 10);
  const startDate = new Date(voucher.start_date).toISOString().slice(0, 10);
  const expiryDate = new Date(voucher.expiry_date).toISOString().slice(0, 10);
  if (today < startDate || today > expiryDate) return NextResponse.json({ ok: false, error: "expired" });
  if (Number(voucher.used_count) >= Number(voucher.usage_limit || Infinity)) return NextResponse.json({ ok: false, error: "limit" });
  if (Number(subtotal) < Number(voucher.min_purchase)) return NextResponse.json({ ok: false, error: "min-purchase" });

  const eligible = parseJson(voucher.eligible_categories);
  if (Array.isArray(eligible) && eligible.length > 0 && !categories.some((cat: string) => eligible.includes(cat))) {
    return NextResponse.json({ ok: false, error: "category" });
  }

  return NextResponse.json({ ok: true, voucher: mapVoucher(voucher) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await req.json();
  const updates: Record<string, unknown> = {};

  if (input.code !== undefined) updates.code = String(input.code).trim().toUpperCase();
  if (input.type !== undefined) updates.type = input.type;
  if (input.value !== undefined) updates.value = input.value;
  if (input.minPurchase !== undefined) updates.min_purchase = input.minPurchase;
  if (input.maxDiscount !== undefined) {
    updates.max_discount = input.maxDiscount && Number(input.maxDiscount) > 0 ? Number(input.maxDiscount) : null;
  }
  if (input.startDate !== undefined) updates.start_date = input.startDate;
  if (input.expiryDate !== undefined) updates.expiry_date = input.expiryDate;
  if (input.usageLimit !== undefined) updates.usage_limit = input.usageLimit;
  if (input.active !== undefined) updates.active = Boolean(input.active);
  if (input.eligibleCategories !== undefined) updates.eligible_categories = input.eligibleCategories;

  const { data, error } = await supabase
    .from("vouchers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Voucher tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(mapVoucher(data));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("vouchers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(true);
}
