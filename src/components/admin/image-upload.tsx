"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductMedia } from "@/components/product-media";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm", "video/quicktime", "video/ogg"];

export function ImageUpload({
  value,
  onChange,
  max = 4,
}: {
  value: string[];
  onChange: (images: string[]) => void;
  max?: number;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error(t("admin.image.badType"));
      return;
    }
    if (value.length >= max) {
      toast.error("Jumlah media produk sudah mencapai batas.");
      return;
    }

    const form = new FormData();
    form.append("media", file);
    setUploading(true);
    try {
      const response = await fetch("/api/uploads/product-media", { method: "POST", body: form });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.url) {
        toast.error(result?.error ?? "Media gagal diunggah. Silakan coba lagi.");
        return;
      }
      onChange([...value, result.url]);
    } catch {
      toast.error("Media gagal diunggah. Periksa koneksi lalu coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden border border-border bg-muted" data-testid={`admin-image-thumb-${i}`}>
            <ProductMedia src={src} alt={`Media ${i + 1}`} fill autoPlay className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={t("admin.image.remove")}
              data-testid={`admin-image-remove-${i}`}
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-foreground/80 text-background"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            data-testid="admin-image-add"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex h-20 w-20 flex-col items-center justify-center gap-1 border border-dashed border-input text-muted-foreground transition-colors hover:border-lime hover:text-foreground disabled:cursor-wait disabled:opacity-50"
            )}
          >
            <ImagePlus className={`h-5 w-5 ${uploading ? "animate-pulse" : ""}`} />
            <span className="font-mono text-[9px] uppercase tracking-widest">{uploading ? "Mengunggah" : t("admin.image.upload")}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        data-testid="admin-image-file-input"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("admin.image.urlOr")}
          data-testid="admin-image-url-input"
          className="h-9 rounded-none text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="admin-image-url-add"
          className="h-9 rounded-none"
          disabled={!url.trim() || value.length >= max}
          onClick={() => {
            if (value.length < max) onChange([...value, url.trim()]);
            setUrl("");
          }}
        >
          +
        </Button>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{t("admin.image.note")}</p>
    </div>
  );
}
