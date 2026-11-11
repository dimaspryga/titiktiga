import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const decodedNumber = decodeURIComponent(number);

  const { data: o, error } = await supabase
    .from("orders")
    .select("*, order_items(*), payment_proofs(file_path, submitted_at)")
    .eq("number", decodedNumber)
    .single();

  if (error || !o) {
    return NextResponse.json(null, { status: 404 });
  }

  const sortedProofs = (o.payment_proofs ?? []).sort(
    (a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );

  return NextResponse.json({
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
  });
}
