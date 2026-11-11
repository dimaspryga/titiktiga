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
  try {
    const { code, subtotal, categories = [] } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ ok: false, error: "invalid" });
    }

    const cleanCode = code.trim().toUpperCase();

    const { data: v, error } = await supabase
      .from("vouchers")
      .select("*")
      .ilike("code", cleanCode)
      .maybeSingle();

    if (error || !v) {
      return NextResponse.json({ ok: false, error: "invalid" });
    }

    const voucher = mapVoucher(v);

    if (!voucher.active) {
      return NextResponse.json({ ok: false, error: "inactive" });
    }

    const today = new Date().toISOString().slice(0, 10);
    const start = String(voucher.startDate).slice(0, 10);
    const end = String(voucher.expiryDate).slice(0, 10);

    if (today < start || today > end) {
      return NextResponse.json({ ok: false, error: "expired" });
    }

    if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ ok: false, error: "limit" });
    }

    if (Number(subtotal) < Number(voucher.minPurchase)) {
      return NextResponse.json({ ok: false, error: "min-purchase" });
    }

    if (
      Array.isArray(voucher.eligibleCategories) &&
      voucher.eligibleCategories.length > 0
    ) {
      const eligible = voucher.eligibleCategories as string[];
      const match = categories.some((c: string) =>
        eligible.map((x: string) => x.toLowerCase()).includes(c.toLowerCase())
      );
      if (!match) {
        return NextResponse.json({ ok: false, error: "category" });
      }
    }

    return NextResponse.json({ ok: true, voucher });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 500 });
  }
}

