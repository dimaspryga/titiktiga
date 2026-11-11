import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import supabase from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const form = await req.formData();
  const file = form.get("proof") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Screenshot bukti transfer wajib dipilih" }, { status: 400 });
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

  await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", name), Buffer.from(bytes));

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
    return NextResponse.json({ error: proofError.message }, { status: 500 });
  }

  await supabase
    .from("orders")
    .update({ payment_status: "submitted" })
    .eq("id", orderId);

  return NextResponse.json({ url: filePath });
}
