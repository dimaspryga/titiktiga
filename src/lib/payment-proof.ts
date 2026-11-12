import supabase from "@/lib/supabase";

const STORAGE_BUCKET = "payment-proofs";
const LEGACY_PUBLIC_PATH = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

export async function signedPaymentProofUrl(filePath: string | null | undefined) {
  if (!filePath) return null;

  const markerIndex = filePath.indexOf(LEGACY_PUBLIC_PATH);
  const storagePath = markerIndex >= 0
    ? decodeURIComponent(filePath.slice(markerIndex + LEGACY_PUBLIC_PATH.length))
    : filePath;
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 10 * 60);

  if (error) throw error;
  return data.signedUrl;
}
