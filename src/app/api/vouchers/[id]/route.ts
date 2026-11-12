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
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Voucher tidak ditemukan" }, { status: 404 });

  return NextResponse.json(mapVoucher(data));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("vouchers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(true);
}
