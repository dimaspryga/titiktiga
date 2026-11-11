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
    items: (o.order_items ?? []).map((i: any) => ({
      productId: i.product_id,
      slug: i.slug,
      name: i.name,
      image: i.image_url ?? "",
      quantity: Number(i.quantity),
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const page = Math.max(1, Number(q.get("page") ?? 1));
  const perPage = Math.max(1, Number(q.get("perPage") ?? 6));

  let query = supabase
    .from("orders")
    .select("id", { count: "exact" });

  const status = q.get("status");
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const search = q.get("q");
  if (search) {
    query = query.or(
      `number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`
    );
  }

  const email = q.get("email");
  if (email) {
    query = query.eq("customer_email", email);
  }

  const offset = (page - 1) * perPage;
  query = query.order("created_at", { ascending: false }).range(offset, offset + perPage - 1);

  const { data: rows, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items: any[] = [];
  for (const r of rows ?? []) {
    const order = await fullOrder(r.id);
    if (order) items.push(order);
  }

  const total = count ?? 0;
  return NextResponse.json({
    items,
    total,
    page,
    perPage,
    hasMore: page * perPage < total,
  });
}

export async function POST(req: NextRequest) {
  const i = await req.json();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      number: i.number,
      customer_name: i.customerName,
      customer_email: i.customerEmail,
      customer_phone: i.customerPhone ?? "",
      address: i.address,
      notes: i.notes ?? "",
      subtotal: i.subtotal,
      product_discount: i.productDiscount ?? 0,
      voucher_code: i.voucherCode || null,
      voucher_discount: i.voucherDiscount ?? 0,
      shipping_fee: i.shippingFee ?? 0,
      total: i.total,
      status: i.status ?? "pending",
      payment_method: i.paymentMethod ?? "transfer",
      payment_status: i.paymentStatus ?? "waiting",
    })
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: error?.message ?? "Gagal membuat pesanan" },
      { status: 400 }
    );
  }

  if (Array.isArray(i.items) && i.items.length > 0) {
    const items = i.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId || null,
      slug: item.slug,
      name: item.name,
      image_url: item.image ?? "",
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }));
    await supabase.from("order_items").insert(items);
  }

  return NextResponse.json(await fullOrder(order.id), { status: 201 });
}
