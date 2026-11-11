import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { unlink, writeFile, mkdir } from "fs/promises";
import path from "path";
import supabase from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const form = await req.formData();
  const formFile = form.get("proof");
  const file = formFile instanceof File ? formFile : null;

  if (!file) {
    return NextResponse.json({ error: "Screenshot bukti transfer wajib dipilih" }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, payment_method")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }
  if (order.payment_method !== "transfer") {
    return NextResponse.json({ error: "Bukti hanya dapat diunggah untuk pembayaran transfer" }, { status: 400 });
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Format harus JPG, PNG, atau WebP" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran maksimal 5 MB" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const name = `${randomUUID()}.${ext}`;

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  const absolutePath = path.join(uploadDirectory, name);
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(absolutePath, Buffer.from(bytes));

  const filePath = `/uploads/${name}`;

  const { error: proofError } = await supabase.from("payment_proofs").insert({
    order_id: orderId,
    original_name: file.name,
    mime_type: file.type,
    file_path: filePath,
    file_size: bytes.byteLength,
    status: "submitted",
  });

  if (proofError) {
    await unlink(absolutePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
    return NextResponse.json({ error: proofError.message }, { status: 500 });
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({ payment_status: "submitted" })
    .eq("id", orderId);

  if (orderUpdateError) {
    return NextResponse.json({ error: orderUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: filePath });
}
