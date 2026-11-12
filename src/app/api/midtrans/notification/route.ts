import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import supabase from "@/lib/supabase";
import { midtransServerKey } from "@/lib/runtime-env";

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type || "midtrans";

    if (!orderId || !transactionStatus) {
      return NextResponse.json(
        { error: "order_id dan transaction_status diperlukan" },
        { status: 400 }
      );
    }

    const serverKey = midtransServerKey();

    if (!serverKey || typeof signatureKey !== "string") {
      return NextResponse.json({ error: "Midtrans signature verification is not configured" }, { status: 503 });
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");
    const suppliedSignature = Buffer.from(signatureKey, "hex");
    const expectedSignatureBytes = Buffer.from(expectedSignature, "hex");
    if (
      suppliedSignature.length !== expectedSignatureBytes.length ||
      !crypto.timingSafeEqual(suppliedSignature, expectedSignatureBytes)
    ) {
      return NextResponse.json({ error: "Invalid signature key" }, { status: 403 });
    }

    const { data: order, error: orderLookupError } = await supabase
      .from("orders")
      .select("id, total")
      .eq("number", orderId)
      .maybeSingle();
    if (orderLookupError) {
      return NextResponse.json({ error: orderLookupError.message }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!Number.isFinite(Number(grossAmount)) || Number(grossAmount) !== Number(order.total)) {
      return NextResponse.json({ error: "Payment amount does not match the order" }, { status: 400 });
    }

    // Tentukan payment_status dan order_status berdasarkan status transaksi Midtrans
    let paymentStatus: "approved" | "rejected" | "waiting" = "waiting";
    let orderStatus: "pending" | "processing" | "cancelled" | undefined = undefined;
    const now = new Date().toISOString();

    if (transactionStatus === "settlement") {
      paymentStatus = "approved";
      orderStatus = "processing";
    } else if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        paymentStatus = "approved";
        orderStatus = "processing";
      } else if (fraudStatus === "challenge") {
        paymentStatus = "waiting";
      }
    } else if (transactionStatus === "pending") {
      paymentStatus = "waiting";
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "expire" ||
      transactionStatus === "cancel"
    ) {
      paymentStatus = "rejected";
      orderStatus = "cancelled";
    }

    const updatePayload: Record<string, unknown> = {
      payment_method: "midtrans",
      payment_status: paymentStatus,
      payment_note: `Midtrans (${paymentType}): ${transactionStatus}${fraudStatus ? ` [fraud: ${fraudStatus}]` : ""}`,
      updated_at: now,
    };

    if (paymentStatus === "approved") {
      updatePayload.payment_reviewed_at = now;
    }
    if (orderStatus) {
      updatePayload.status = orderStatus;
    }

    const { error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("number", orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "OK",
      message: `Order ${orderId} updated to ${paymentStatus}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process Midtrans notification" },
      { status: 500 }
    );
  }
}
