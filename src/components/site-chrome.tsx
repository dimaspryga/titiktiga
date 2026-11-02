"use client";

import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <SmoothScroll>
      <SiteHeader />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-lime-foreground"
      >
        {t("nav.close") === "Tutup" ? "Lewati ke konten" : "Skip to content"}
      </a>
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <SiteFooter />
    </SmoothScroll>
  );
}
