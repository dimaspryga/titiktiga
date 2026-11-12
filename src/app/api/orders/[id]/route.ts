import { NextRequest, NextResponse } from "next/server";
import { signedPaymentProofUrl } from "@/lib/payment-proof";
import supabase from "@/lib/supabase";

async function fullOrder(id: string) {
  const { data: o, error } = await supabase
    .from("orders")
    .select("*, order_items(*), payment_proofs(file_path, submitted_at)")
    .eq("id", id)
    .maybeSingle();

  if (error || !o) return { order: null, error };

  const sortedProofs = (o.payment_proofs ?? []).sort(
    (a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return {
    order: {
    id: o.id,
    number: o.number,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone ?? "",
    address: o.address,
    notes: o.notes ?? "",
    items: (o.order_items ?? []).map((x: any) => ({
      productId: x.product_id,
      slug: x.slug,
      name: x.name,
      image: x.image_url ?? "",
      quantity: Number(x.quantity),
      unitPrice: Number(x.unit_price),
      originalUnitPrice: x.original_unit_price == null ? Number(x.unit_price) : Number(x.original_unit_price),
      discountPercent: x.discount_percent == null ? null : Number(x.discount_percent),
      subtotal: Number(x.subtotal),
    })),
    subtotal: Number(o.subtotal),
    productDiscount: Number(o.product_discount ?? 0),
    voucherCode: o.voucher_code ?? null,
    voucherDiscount: Number(o.voucher_discount ?? 0),
    shippingFee: Number(o.shipping_fee ?? 0),
    total: Number(o.total),
    status: o.status,
    paymentMethod: o.payment_method ?? "transfer",
    paymentStatus: o.payment_status,
    paymentNote: o.payment_note ?? "",
    paymentProof: await signedPaymentProofUrl(sortedProofs[0]?.file_path),
    paymentReviewedAt: o.payment_reviewed_at,
    createdAt: o.created_at,
    },
    error: null,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = await req.json();

  const updates: Record<string, unknown> = {};

  if (i.paymentStatus) {
    updates.payment_status = i.paymentStatus;
    updates.payment_note = i.paymentNote ?? "";
    updates.payment_reviewed_at = new Date().toISOString();

    if (i.paymentStatus === "approved" || i.paymentStatus === "rejected") {
      const { error } = await supabase
        .from("payment_proofs")
        .update({
          status: i.paymentStatus,
          reviewer_note: i.paymentNote ?? "",
          reviewed_at: new Date().toISOString(),
        })
        .eq("order_id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  if (i.status) {
    updates.status = i.status;
  }

  if (i.paymentMethod) {
    updates.payment_method = i.paymentMethod;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("orders").update(updates).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const updated = await fullOrder(id);
  if (updated.error) {
    return NextResponse.json({ error: updated.error.message }, { status: 500 });
  }
  if (!updated.order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(updated.order);
}
