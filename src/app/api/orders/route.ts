import { NextRequest, NextResponse } from "next/server";
import { currentAuth } from "@/lib/auth-session";
import { signedPaymentProofUrl } from "@/lib/payment-proof";
import { seedContent } from "@/lib/mock/site";
import { MAX_QUANTITY, unitPrice } from "@/lib/services/pricing";
import supabase from "@/lib/supabase";

async function mapOrder(o: any) {
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
      originalUnitPrice: i.original_unit_price == null ? Number(i.unit_price) : Number(i.original_unit_price),
      discountPercent: i.discount_percent == null ? null : Number(i.discount_percent),
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
    paymentProof: await signedPaymentProofUrl(sortedProofs[0]?.file_path),
    paymentReviewedAt: o.payment_reviewed_at,
    createdAt: o.created_at,
  };
}

async function fullOrder(id: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*), payment_proofs(file_path, submitted_at)")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) return { order: null, error };
  return { order: await mapOrder(order), error: null };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const requestedPage = Number(q.get("page") ?? 1);
  const requestedPerPage = Number(q.get("perPage") ?? 6);
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1;
  const perPage = Number.isFinite(requestedPerPage) ? Math.min(50, Math.max(1, Math.floor(requestedPerPage))) : 6;

  let query = supabase
    .from("orders")
    .select("*, order_items(*), payment_proofs(file_path, submitted_at)", { count: "exact" });

  const status = q.get("status");
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const search = q.get("q")?.trim();
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

  const items = await Promise.all((rows ?? []).map(mapOrder));
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
  const auth = await currentAuth();
  if (!auth) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const i = await req.json().catch(() => null);
  if (!i || typeof i !== "object" || Array.isArray(i)) {
    return NextResponse.json({ error: "Invalid order request" }, { status: 400 });
  }
  if (auth.role !== "admin" && String(i.customerEmail ?? "").trim().toLowerCase() !== auth.email.toLowerCase()) {
    return NextResponse.json({ error: "Order email must match the signed-in account" }, { status: 403 });
  }

  const customerName = String(i.customerName ?? "").trim();
  const customerEmail = String(i.customerEmail ?? "").trim().toLowerCase();
  const customerPhone = String(i.customerPhone ?? "").trim();
  const orderNumber = String(i.number ?? "").trim();
  const paymentMethod = i.paymentMethod === "midtrans" ? "midtrans" : i.paymentMethod === "transfer" ? "transfer" : null;
  if (
    !/^TT-\d{4}-\d{6}$/.test(orderNumber) ||
    customerName.length < 2 ||
    customerName.length > 120 ||
    !/^\S+@\S+\.\S+$/.test(customerEmail) ||
    customerPhone.length > 32 ||
    (i.address != null && String(i.address).length > 500) ||
    (i.notes != null && String(i.notes).length > 2000) ||
    !paymentMethod ||
    !Array.isArray(i.items) ||
    i.items.length < 1 ||
    i.items.length > 50
  ) {
    return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
  }

  const requestedItems: Array<{ productId: string; quantity: number }> = [];
  for (const item of i.items) {
    const productId = String(item?.productId ?? "");
    const quantity = Number(item?.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 });
    }
    requestedItems.push({ productId, quantity });
  }
  if (new Set(requestedItems.map((item) => item.productId)).size !== requestedItems.length) {
    return NextResponse.json({ error: "Duplicate products are not allowed" }, { status: 400 });
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, slug, name, category_slug, price, discount_percent, stock, status, product_images(url, position)")
    .in("id", requestedItems.map((item) => item.productId));
  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const productsById = new Map((products ?? []).map((product) => [product.id, product]));
  const orderItems: Array<{
    product_id: string;
    slug: string;
    name: string;
    image_url: string;
    quantity: number;
    unit_price: number;
    original_unit_price: number;
    discount_percent: number | null;
    subtotal: number;
  }> = [];
  let grossSubtotal = 0;
  let subtotal = 0;
  const categories = new Set<string>();
  for (const item of requestedItems) {
    const product = productsById.get(item.productId);
    if (!product || product.status !== "active") {
      return NextResponse.json({ error: "A product is no longer available" }, { status: 409 });
    }
    if (item.quantity > Number(product.stock)) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 409 });
    }

    const originalUnitPrice = Number(product.price);
    const discountedUnitPrice = unitPrice(originalUnitPrice, product.discount_percent);
    const itemSubtotal = discountedUnitPrice * item.quantity;
    const images = (product.product_images ?? []).sort(
      (a: { position: number | null }, b: { position: number | null }) => (a.position ?? 0) - (b.position ?? 0)
    );
    grossSubtotal += originalUnitPrice * item.quantity;
    subtotal += itemSubtotal;
    if (product.category_slug) categories.add(product.category_slug);
    orderItems.push({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image_url: images[0]?.url ?? "",
      quantity: item.quantity,
      unit_price: discountedUnitPrice,
      original_unit_price: originalUnitPrice,
      discount_percent: product.discount_percent,
      subtotal: itemSubtotal,
    });
  }

  let voucherCode: string | null = null;
  let voucherDiscount = 0;
  if (i.voucherCode) {
    if (typeof i.voucherCode !== "string") {
      return NextResponse.json({ error: "Invalid voucher code" }, { status: 400 });
    }
    const code = i.voucherCode.trim().toUpperCase();
    voucherCode = code;
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("*")
      .ilike("code", code)
      .maybeSingle();
    if (voucherError) {
      return NextResponse.json({ error: voucherError.message }, { status: 500 });
    }
    if (!voucher || !voucher.active) {
      return NextResponse.json({ error: "Voucher is unavailable" }, { status: 400 });
    }
    if (voucher.type !== "percentage" && voucher.type !== "fixed") {
      return NextResponse.json({ error: "Voucher configuration is invalid" }, { status: 500 });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (
      today < String(voucher.start_date).slice(0, 10) ||
      today > String(voucher.expiry_date).slice(0, 10) ||
      (voucher.usage_limit != null && Number(voucher.used_count) >= Number(voucher.usage_limit)) ||
      subtotal < Number(voucher.min_purchase)
    ) {
      return NextResponse.json({ error: "Voucher is no longer valid" }, { status: 400 });
    }

    let eligibleCategories = voucher.eligible_categories;
    if (typeof eligibleCategories === "string") {
      try {
        eligibleCategories = JSON.parse(eligibleCategories);
      } catch {
        return NextResponse.json({ error: "Voucher configuration is invalid" }, { status: 500 });
      }
    }
    if (
      Array.isArray(eligibleCategories) &&
      eligibleCategories.length > 0 &&
      ![...categories].some((category) =>
        eligibleCategories.some((eligible: unknown) =>
          typeof eligible === "string" && eligible.toLowerCase() === category.toLowerCase()
        )
      )
    ) {
      return NextResponse.json({ error: "Voucher does not apply to these products" }, { status: 400 });
    }

    voucherDiscount = voucher.type === "percentage"
      ? Math.round((subtotal * Number(voucher.value)) / 100)
      : Math.round(Number(voucher.value));
    if (voucher.type === "percentage" && Number(voucher.max_discount) > 0) {
      voucherDiscount = Math.min(voucherDiscount, Number(voucher.max_discount));
    }
    voucherDiscount = Math.max(0, Math.min(voucherDiscount, subtotal));
  }

  const { data: contentRow, error: contentError } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  if (contentError) {
    return NextResponse.json({ error: contentError.message }, { status: 500 });
  }

  let content = contentRow?.content ?? {};
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Store configuration is invalid" }, { status: 500 });
    }
  }
  const store = (content as { store?: Record<string, unknown> }).store ?? seedContent.store;
  const configuredShippingFee = Number(store.shippingFee ?? seedContent.store.shippingFee);
  const configuredFreeShippingThreshold = Number(
    store.freeShippingThreshold ?? seedContent.store.freeShippingThreshold
  );
  if (
    !Number.isFinite(configuredShippingFee) ||
    configuredShippingFee < 0 ||
    !Number.isFinite(configuredFreeShippingThreshold) ||
    configuredFreeShippingThreshold < 0
  ) {
    return NextResponse.json({ error: "Store shipping configuration is invalid" }, { status: 500 });
  }
  const shippingFee = subtotal >= configuredFreeShippingThreshold ? 0 : configuredShippingFee;
  const total = Math.max(0, subtotal - voucherDiscount + shippingFee);
  const productDiscount = grossSubtotal - subtotal;
  if (
    Number(i.subtotal) !== subtotal ||
    Number(i.productDiscount ?? 0) !== productDiscount ||
    Number(i.voucherDiscount ?? 0) !== voucherDiscount ||
    Number(i.shippingFee ?? 0) !== shippingFee ||
    Number(i.total) !== total
  ) {
    return NextResponse.json(
      { error: "Order prices changed. Refresh your cart and try again." },
      { status: 409 }
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      address: String(i.address ?? ""),
      notes: String(i.notes ?? ""),
      subtotal,
      product_discount: productDiscount,
      voucher_code: voucherCode,
      voucher_discount: voucherDiscount,
      shipping_fee: shippingFee,
      total,
      status: "pending",
      payment_method: paymentMethod,
      payment_status: "waiting",
    })
    .select()
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: error?.message ?? "Gagal membuat pesanan" },
      { status: 400 }
    );
  }

  if (orderItems.length > 0) {
    const items = orderItems.map((item) => ({
      order_id: order.id,
      ...item,
    }));
    const { error: itemsError } = await supabase.from("order_items").insert(items);
    if (itemsError) {
      const { error: cleanupError } = await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        {
          error: itemsError.message,
          ...(cleanupError && { cleanupError: cleanupError.message }),
        },
        { status: 500 }
      );
    }
  }

  const created = await fullOrder(order.id);
  if (created.error || !created.order) {
    return NextResponse.json(
      { error: created.error?.message ?? "Pesanan tidak dapat dibaca kembali setelah disimpan" },
      { status: 500 }
    );
  }
  return NextResponse.json(created.order, { status: 201 });
}
