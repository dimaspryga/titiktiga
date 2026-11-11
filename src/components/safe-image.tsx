"use client";

import { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SafeImageProps = Omit<ImageProps, "src" | "alt" | "onError"> & {
  src: string;
  alt: string;
  fallbackLabel?: string;
};

/**
 * next/image dengan fallback branded: jika URL kosong atau gagal dimuat,
 * tampil placeholder tiga titik Titiktiga — bukan gambar patah.
 */
export function SafeImage({ src, alt, fallbackLabel, className, fill, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-muted",
          fill && "absolute inset-0",
          className
        )}
        data-testid="safe-image-fallback"
      >
        <span className="inline-flex items-center gap-1" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-lime" />
          <span className="h-2 w-2 rounded-full bg-foreground/60" />
          <span className="h-2 w-2 rounded-full bg-foreground/30" />
        </span>
        {fallbackLabel && (
          <span className="max-w-[80%] truncate px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(className, fill && "absolute inset-0 h-full w-full object-cover")}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
