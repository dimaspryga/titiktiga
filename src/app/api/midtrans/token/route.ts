import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { applicationUrl, midtransApiBaseUrl, midtransClientKey, midtransServerKey } from "@/lib/runtime-env";
import { currentAuth } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
  try {
    const auth = await currentAuth();
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, orderNumber, grossAmount } = body;

    if (!orderNumber || !Number.isFinite(Number(grossAmount)) || Number(grossAmount) <= 0) {
      return NextResponse.json(
        { error: "orderNumber dan grossAmount wajib diisi" },
        { status: 400 }
      );
    }

    const orderQuery = supabase
      .from("orders")
      .select("id, number, total, customer_name, customer_email, customer_phone, payment_status")
      .eq("number", String(orderNumber))
      .maybeSingle();
    const { data: order, error: orderError } = await orderQuery;
    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }
    if (!order || (orderId && order.id !== orderId)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (auth.role !== "admin" && auth.email.toLowerCase() !== order.customer_email.toLowerCase()) {
      return NextResponse.json({ error: "Access to this order is denied" }, { status: 403 });
    }
    if (Number(order.total) !== Math.round(Number(grossAmount))) {
      return NextResponse.json({ error: "Payment amount does not match the order" }, { status: 400 });
    }
    if (order.payment_status === "approved") {
      return NextResponse.json({ error: "This order has already been paid" }, { status: 409 });
    }

    const serverKey = midtransServerKey();
    const clientKey = midtransClientKey();
    const isConfigured = Boolean(serverKey && clientKey);

    // Jika API Key belum diisi di .env.local, return status readiness untuk UI
    if (!isConfigured) {
      return NextResponse.json({
        isConfigured: false,
        token: null,
        redirectUrl: null,
        message:
          "API Key Midtrans belum dikonfigurasi. Masukkan NEXT_PUBLIC_MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY di .env.local.",
        orderNumber: order.number,
      });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_method: "midtrans" })
      .eq("id", order.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Prepare item details for Midtrans
    const appUrl = applicationUrl(req.url, req.headers);
    const snapApiUrl = `${midtransApiBaseUrl()}/transactions`;
    const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

    let itemDetails: Array<{ id: string; price: number; quantity: number; name: string }> = [];

    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("product_id, name, unit_price, quantity")
      .eq("order_id", order.id);
    if (orderItemsError) {
      return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
    }

    if (orderItems?.length) {
      itemDetails = orderItems.map((item, idx) => {
        const itemPrice = Math.round(Number(item.unit_price));
        return {
          id: String(item.product_id || `item-${idx + 1}`).slice(0, 50),
          price: itemPrice,
          quantity: Math.max(1, Number(item.quantity)),
          name: String(item.name || `Item ${idx + 1}`).slice(0, 50),
        };
      });

      // Validasi sum item details vs gross_amount
      const itemsSum = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gross = Number(order.total);
      if (itemsSum !== gross) {
        // Jika ada selisih diskon/ongkir, sesuaikan agar Midtrans tidak menolak
        itemDetails = [
          {
            id: `order-${order.number}`,
            price: gross,
            quantity: 1,
            name: `Total Pesanan ${order.number}`.slice(0, 50),
          },
        ];
      }
    } else {
      itemDetails = [
        {
          id: `order-${order.number}`,
          price: Number(order.total),
          quantity: 1,
          name: `Total Pesanan ${order.number}`.slice(0, 50),
        },
      ];
    }

    const payload = {
      transaction_details: {
        order_id: order.number,
        gross_amount: Number(order.total),
      },
      customer_details: {
        first_name: order.customer_name || "Customer",
        email: order.customer_email,
        phone: order.customer_phone || undefined,
      },
      item_details: itemDetails,
      callbacks: {
        finish: `${appUrl}/checkout/success?number=${encodeURIComponent(orderNumber)}`,
      },
    };

    const midtransRes = await fetch(snapApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await midtransRes.json();

    if (!midtransRes.ok) {
      return NextResponse.json(
        {
          isConfigured: true,
          error:
            Array.isArray(data.error_messages)
              ? data.error_messages.join(", ")
              : data.message || "Gagal membuat transaksi Midtrans",
        },
        { status: midtransRes.status }
      );
    }

    return NextResponse.json({
      isConfigured: true,
      token: data.token,
      redirectUrl: data.redirect_url,
      orderNumber: order.number,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan pada server saat memproses Midtrans" },
      { status: 500 }
    );
  }
}
