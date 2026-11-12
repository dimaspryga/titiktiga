"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center" data-testid="not-found-page">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">404</p>
      <p className="font-display text-6xl font-medium tracking-tight md:text-8xl">Titik. Titik. Titik.</p>
      <p className="max-w-sm text-muted-foreground">{t("notfound.body")}</p>
      <Link
        href="/"
        data-testid="not-found-home-link"
        className="mt-4 inline-flex h-12 items-center gap-2 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85"
      >
        <ArrowLeft className="h-4 w-4" /> {t("notfound.cta")}
      </Link>
    </div>
  );
}
