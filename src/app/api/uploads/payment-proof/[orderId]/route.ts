import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import supabase from "@/lib/supabase";
import { supabaseServiceRoleKey } from "@/lib/runtime-env";
import { currentAuth } from "@/lib/auth-session";
import { signedPaymentProofUrl } from "@/lib/payment-proof";

const STORAGE_BUCKET = "payment-proofs";
const PROOF_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const auth = await currentAuth();
  if (!auth) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran maksimal 5 MB" }, { status: 413 });
  }

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
    .select("id, payment_method, customer_email")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }
  if (auth.role !== "admin" && auth.email.toLowerCase() !== order.customer_email.toLowerCase()) {
    return NextResponse.json({ error: "Akses ke pesanan ditolak" }, { status: 403 });
  }
  if (order.payment_method !== "transfer") {
    return NextResponse.json({ error: "Bukti hanya dapat diunggah untuk pembayaran transfer" }, { status: 400 });
  }

  if (!PROOF_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format harus JPG, PNG, atau WebP" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > 5 * 1024 * 1024 || !isValidImage(bytes, file.type)) {
    if (bytes.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran maksimal 5 MB" }, { status: 400 });
    }
    return NextResponse.json({ error: "Isi file tidak sesuai format gambar yang dipilih" }, { status: 400 });
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const storagePath = `${orderId}/${randomUUID()}.${ext}`;
  const storage = supabase.storage;
  const { data: bucket, error: bucketError } = await storage.getBucket(STORAGE_BUCKET);
  if (bucketError && !bucketError.message.toLowerCase().includes("not found")) {
    return NextResponse.json({ error: "Bucket bukti pembayaran tidak dapat diperiksa" }, { status: 502 });
  }
  if (bucket?.public) {
    const { error: privacyError } = await storage.updateBucket(STORAGE_BUCKET, {
      public: false,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: PROOF_MIME_TYPES,
    });
    if (privacyError) {
      return NextResponse.json({ error: "Bucket bukti pembayaran gagal diamankan" }, { status: 502 });
    }
  }
  if (!bucket) {
    const { error: createBucketError } = await storage.createBucket(STORAGE_BUCKET, {
      public: false,
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
  }
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
      public: false,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: PROOF_MIME_TYPES,
    });
    if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
      console.error("Payment proof storage bucket creation failed", createBucketError);
      return NextResponse.json({ error: "Bucket penyimpanan bukti pembayaran gagal dibuat" }, { status: 502 });
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

  const filePath = storagePath;
  let signedUrl: string;
  try {
    const url = await signedPaymentProofUrl(filePath);
    if (!url) throw new Error("A signed URL was not returned");
    signedUrl = url;
  } catch (error) {
    console.error("Payment proof signed URL creation failed", error);
    const { error: cleanupError } = await storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (cleanupError) console.error("Payment proof storage cleanup failed", cleanupError);
    return NextResponse.json({ error: "Tautan aman untuk bukti pembayaran gagal dibuat" }, { status: 502 });
  }

  const { error: proofError } = await supabase.from("payment_proofs").insert({
    order_id: orderId,
    original_name: file.name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 128),
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

  return NextResponse.json({ url: signedUrl });
}

function isValidImage(bytes: ArrayBuffer, mimeType: string) {
  const data = new Uint8Array(bytes);
  if (mimeType === "image/jpeg") {
    return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      data.length >= 8 &&
      data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47 &&
      data[4] === 0x0d &&
      data[5] === 0x0a &&
      data[6] === 0x1a &&
      data[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    return (
      data.length >= 12 &&
      String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...data.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}
