"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { LogoMark } from "@/components/logo";
import { useI18n } from "@/lib/i18n";
import { useCategories, useContent } from "@/lib/hooks";
import { CONSULT_LINKS } from "@/lib/repositories/engagement";

export function SiteFooter() {
  const { t, tt } = useI18n();
  const { data: content } = useContent();
  const { data: categories } = useCategories();
  const [localTime, setLocalTime] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");

  useEffect(() => {
    const updateTime = () =>
      setLocalTime(new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date()));
    updateTime();
    const interval = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const submitInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const destination = content?.contact.email;
    if (!destination) return;
    const subject = encodeURIComponent(t("consult.label"));
    const body = encodeURIComponent(`${t("footer.contact")}: ${inquiryEmail}`);
    window.location.href = `mailto:${destination}?subject=${subject}&body=${body}`;
  };

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
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-t border-background/15 pt-6">
            <div className="flex items-center gap-3">
              <LogoMark className="[&>circle]:fill-background [&>circle:last-child]:fill-lime" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/60">
                {tt(content?.store.tagline)}
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-background/70">{t("footer.tagline")}</p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-lime">{t("demo.note")}</p>
            <h3 className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-background/50">{t("footer.help")}</h3>
            <ul className="mt-4 space-y-3">
              {help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-sm text-background/85" data-testid={`footer-link-${l.href}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-background/15 pt-6 sm:border-l sm:pl-6">
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
          <div className="border-t border-background/15 pt-6 sm:border-l sm:pl-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/50">{t("nav.shop")}</h3>
            <ul className="mt-5 space-y-3">
              {(categories ?? []).map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    className="link-underline text-sm text-background/85"
                  >
                    {tt(category.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-background/15 pt-6 sm:border-l sm:pl-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/50">{t("footer.contact")}</h3>
            <ul className="mt-5 space-y-3 text-sm text-background/85">
              <li>{content?.contact.email}</li>
              <li>{content?.contact.phone}</li>
              <li className="leading-relaxed text-background/60">{tt(content?.contact.address)}</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={CONSULT_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full border border-background/20 px-3 py-1.5 text-xs text-background/85 transition-colors hover:border-lime hover:text-lime">
                {t("consult.whatsapp")}
              </a>
              <a href={CONSULT_LINKS.discord} target="_blank" rel="noopener noreferrer" className="rounded-full border border-background/20 px-3 py-1.5 text-xs text-background/85 transition-colors hover:border-lime hover:text-lime">
                {t("consult.discord")}
              </a>
            </div>
            <form onSubmit={submitInquiry} className="mt-6 flex items-center gap-2" data-testid="footer-inquiry-form">
              <label htmlFor="footer-inquiry-email" className="sr-only">{t("footer.contact")}</label>
              <input
                id="footer-inquiry-email"
                type="email"
                required
                value={inquiryEmail}
                onChange={(event) => setInquiryEmail(event.target.value)}
                placeholder={t("footer.contact")}
                className="h-10 min-w-0 flex-1 rounded-full border border-background/20 bg-background/5 px-4 text-xs text-background outline-none transition-colors placeholder:text-background/50 focus:border-lime"
              />
              <button
                type="submit"
                disabled={!content?.contact.email}
                aria-label={t("consult.label")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-lime-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <ArrowUp className="h-4 w-4 rotate-45" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-16 select-none overflow-hidden" aria-hidden="true">
          <p className="whitespace-nowrap font-display text-[18vw] font-semibold lowercase leading-none text-background/10 md:text-[11rem]">
            titiktiga<span className="text-lime">.</span>
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-background/15 pt-6 text-xs text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Titiktiga. {t("footer.rights")}</p>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="font-mono uppercase tracking-[0.18em]">
              Yogyakarta — Indonesia{localTime ? ` · ${localTime} WIB` : ""}
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-background/20 px-4 transition-colors hover:border-lime hover:text-lime"
              aria-label={t("nav.home")}
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              {t("nav.home")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
