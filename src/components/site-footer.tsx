"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { useI18n } from "@/lib/i18n";
import { useContent } from "@/lib/hooks";

export function SiteFooter() {
  const { t, tt } = useI18n();
  const { data: content } = useContent();

  const browse = [
    { href: "/products", label: t("nav.shop") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/portfolio", label: t("nav.portfolio") },
    { href: "/services", label: t("nav.services") },
    { href: "/about", label: t("nav.about") },
  ];
  const help = [
    { href: "/contact", label: t("nav.contact") },
    { href: "/account", label: t("nav.account") },
    { href: "/orders", label: t("nav.orders") },
    { href: "/admin/dashboard", label: t("nav.admin") },
  ];

  return (
    <footer className="border-t border-border bg-foreground text-background" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-8 md:pt-24">
        <div className="mb-16 flex flex-wrap items-center justify-between gap-6 border-t border-background/15 pt-8 md:mb-20">
          <div>
            <p className="font-display text-2xl font-medium md:text-3xl">{t("footer.download.title")}</p>
            <p className="mt-1 max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-background/50">
              {t("footer.download.note")}
            </p>
          </div>
          <a
            href="/download-source"
            download="titiktiga-source.zip"
            data-testid="footer-download-source"
            className="inline-flex h-12 items-center gap-2 rounded-none bg-lime px-6 text-sm font-semibold text-lime-foreground transition-colors hover:bg-lime/85"
          >
            <Download className="h-4 w-4" /> {t("footer.download.label")}
          </a>
        </div>
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="flex items-center gap-3">
              <LogoMark className="[&>circle]:fill-background [&>circle:last-child]:fill-lime" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/60">
                {tt(content?.store.tagline)}
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-background/70">{t("footer.tagline")}</p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-lime">{t("demo.note")}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/50">{t("footer.nav")}</h3>
            <ul className="mt-5 space-y-3">
              {browse.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-sm text-background/85" data-testid={`footer-link-${l.href}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/50">{t("footer.help")}</h3>
            <ul className="mt-5 space-y-3">
              {help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-sm text-background/85" data-testid={`footer-link-${l.href}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/50">{t("footer.contact")}</h3>
            <ul className="mt-5 space-y-3 text-sm text-background/85">
              <li>{content?.contact.email}</li>
              <li>{content?.contact.phone}</li>
              <li className="leading-relaxed text-background/60">{tt(content?.contact.address)}</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 select-none overflow-hidden" aria-hidden="true">
          <p className="whitespace-nowrap font-display text-[18vw] font-semibold lowercase leading-none text-background/10 md:text-[11rem]">
            titiktiga<span className="text-lime">.</span>
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-background/15 pt-6 text-xs text-background/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Titiktiga. {t("footer.rights")}</p>
          <p className="font-mono uppercase tracking-[0.18em]">Yogyakarta — Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
