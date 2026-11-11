import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import {
  applicationUrl,
  midtransApiBaseUrl,
  midtransClientKey,
  midtransServerKey,
} from "@/lib/runtime-env";

interface ItemDetailInput {
  productId?: string;
  id?: string;
  name: string;
  unitPrice?: number;
  price?: number;
  quantity: number;
  subtotal?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      grossAmount,
      customerName,
      customerEmail,
      customerPhone,
      items,
    } = body;

    if (!orderNumber || !grossAmount) {
      return NextResponse.json(
        { error: "orderNumber dan grossAmount wajib diisi" },
        { status: 400 }
      );
    }

    const serverKey = midtransServerKey();
    const clientKey = midtransClientKey();
    const isConfigured = Boolean(serverKey && clientKey);

    // Update order in Supabase with payment_method = 'midtrans'
    if (orderId || orderNumber) {
      const matchQuery = orderId
        ? supabase.from("orders").update({ payment_method: "midtrans" }).eq("id", orderId)
        : supabase.from("orders").update({ payment_method: "midtrans" }).eq("number", orderNumber);
      await matchQuery;
    }

    // Jika API Key belum diisi di .env.local, return status readiness untuk UI
    if (!isConfigured) {
      return NextResponse.json({
        isConfigured: false,
        token: null,
        redirectUrl: null,
        message:
          "API Key Midtrans belum dikonfigurasi. Masukkan NEXT_PUBLIC_MIDTRANS_CLIENT_KEY dan MIDTRANS_SERVER_KEY di .env.local.",
        orderNumber,
      });
    }

    // Prepare item details for Midtrans
    const appUrl = applicationUrl(req.url, req.headers);
    const snapApiUrl = `${midtransApiBaseUrl()}/transactions`;
    const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

    let itemDetails: Array<{ id: string; price: number; quantity: number; name: string }> = [];

    if (Array.isArray(items) && items.length > 0) {
      itemDetails = items.map((item: ItemDetailInput, idx: number) => {
        const itemPrice = Math.round(Number(item.unitPrice ?? item.price ?? 0));
        return {
          id: String(item.productId || item.id || `item-${idx + 1}`).slice(0, 50),
          price: itemPrice,
          quantity: Math.max(1, Number(item.quantity || 1)),
          name: String(item.name || `Item ${idx + 1}`).slice(0, 50),
        };
      });

      // Validasi sum item details vs gross_amount
      const itemsSum = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gross = Math.round(Number(grossAmount));
      if (itemsSum !== gross) {
        // Jika ada selisih diskon/ongkir, sesuaikan agar Midtrans tidak menolak
        itemDetails = [
          {
            id: `order-${orderNumber}`,
            price: gross,
            quantity: 1,
            name: `Total Pesanan ${orderNumber}`.slice(0, 50),
          },
        ];
      }
    } else {
      itemDetails = [
        {
          id: `order-${orderNumber}`,
          price: Math.round(Number(grossAmount)),
          quantity: 1,
          name: `Total Pesanan ${orderNumber}`.slice(0, 50),
        },
      ];
    }

    const payload = {
      transaction_details: {
        order_id: orderNumber,
        gross_amount: Math.round(Number(grossAmount)),
      },
      customer_details: {
        first_name: customerName || "Customer",
        email: customerEmail || "customer@example.com",
        phone: customerPhone || undefined,
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
      orderNumber,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan pada server saat memproses Midtrans" },
      { status: 500 }
    );
  }
}

