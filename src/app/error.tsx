"use client";

import { RotateCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center" data-testid="error-page">
      <p className="font-display text-4xl font-medium md:text-6xl">Ada yang salah.</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Coba lagi — jika masih gagal, reset data demo di Pengaturan Admin.
      </p>
      <button
        type="button"
        onClick={reset}
        data-testid="error-retry-button"
        className="inline-flex h-12 items-center gap-2 rounded-none bg-foreground px-8 font-semibold text-background hover:bg-foreground/85"
      >
        <RotateCcw className="h-4 w-4" /> Coba Lagi
      </button>
    </div>
  );
}
