import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

async function fullOrder(id: string) {
  const { data: o, error } = await supabase
    .from("orders")
    .select("*, order_items(*), payment_proofs(file_path, submitted_at)")
    .eq("id", id)
    .single();

  if (error || !o) return null;

  const sortedProofs = (o.payment_proofs ?? []).sort(
    (a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return {
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
    paymentProof: sortedProofs[0]?.file_path ?? null,
    paymentReviewedAt: o.payment_reviewed_at,
    createdAt: o.created_at,
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
      await supabase
        .from("payment_proofs")
        .update({
          status: i.paymentStatus,
          reviewer_note: i.paymentNote ?? "",
          reviewed_at: new Date().toISOString(),
        })
        .eq("order_id", id);
    }
  }

  if (i.status) {
    updates.status = i.status;
  }

  if (i.paymentMethod) {
    updates.payment_method = i.paymentMethod;
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("orders").update(updates).eq("id", id);
  }

  const updated = await fullOrder(id);
  if (!updated) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
