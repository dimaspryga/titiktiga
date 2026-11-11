import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import supabase from "@/lib/supabase";
import { supabaseServiceRoleKey } from "@/lib/runtime-env";

const STORAGE_BUCKET = "payment-proofs";
const PROOF_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  let orderId: string;
  let file: File | null;
  try {
    ({ orderId } = await params);
    const form = await req.formData();
    const formFile = form.get("proof");
    file = formFile instanceof File ? formFile : null;
  } catch (error) {
    console.error("Payment proof request could not be read", error);
    return NextResponse.json({ error: "Permintaan unggah bukti pembayaran tidak dapat dibaca" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Screenshot bukti transfer wajib dipilih" }, { status: 400 });
  }

  if (!supabaseServiceRoleKey()) {
    return NextResponse.json(
      { error: "Unggah bukti pembayaran belum dikonfigurasi. Pastikan SUPABASE_SERVICE_ROLE_KEY tersedia di server." },
      { status: 503 }
    );
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

  if (!PROOF_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format harus JPG, PNG, atau WebP" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran maksimal 5 MB" }, { status: 400 });
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const storagePath = `${orderId}/${randomUUID()}.${ext}`;
  const storage = supabase.storage;
  const uploadOptions = {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  };
  let { error: storageError } = await storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, Buffer.from(bytes), {
      ...uploadOptions,
    });

  if (storageError?.message.toLowerCase().includes("bucket not found")) {
    const { error: createBucketError } = await storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: PROOF_MIME_TYPES,
    });

    if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
      console.error("Payment proof storage bucket creation failed", createBucketError);
      return NextResponse.json(
        { error: `Bucket penyimpanan bukti pembayaran belum tersedia dan gagal dibuat: ${createBucketError.message}` },
        { status: 502 }
      );
    }

    const retry = await storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, Buffer.from(bytes), uploadOptions);
    storageError = retry.error;
  }

  if (storageError) {
    console.error("Payment proof storage upload failed", storageError);
    return NextResponse.json(
      { error: `File bukti pembayaran gagal diunggah ke Supabase Storage: ${storageError.message}` },
      { status: 502 }
    );
  }

  const filePath = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
  const { error: proofError } = await supabase.from("payment_proofs").insert({
    order_id: orderId,
    original_name: file.name,
    mime_type: file.type,
    file_path: filePath,
    file_size: bytes.byteLength,
    status: "submitted",
  });

  if (proofError) {
    console.error("Payment proof database insert failed", proofError);
    const { error: cleanupError } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (cleanupError) console.error("Payment proof storage cleanup failed", cleanupError);
    return NextResponse.json({ error: proofError.message }, { status: 500 });
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({ payment_status: "submitted" })
    .eq("id", orderId);

  if (orderUpdateError) {
    console.error("Order payment status update failed", orderUpdateError);
    const { error: proofCleanupError } = await supabase.from("payment_proofs").delete().eq("order_id", orderId).eq("file_path", filePath);
    const { error: storageCleanupError } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (proofCleanupError) console.error("Payment proof database cleanup failed", proofCleanupError);
    if (storageCleanupError) console.error("Payment proof storage cleanup failed", storageCleanupError);
    return NextResponse.json({ error: orderUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: filePath });
}
