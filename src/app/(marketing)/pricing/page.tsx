"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { DotsArc, DoodleBand } from "@/components/doodles";
import { SectionDivider } from "@/components/section-divider";
import { FaqList } from "@/components/faq";
import { PricingCards } from "@/components/pricing-cards";
import { ConsultButtons } from "@/components/consult-buttons";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion";
import { Check } from "lucide-react";
import { useEngagement } from "@/lib/repositories/engagement";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { t, tt } = useI18n();
  const { data: engagement } = useEngagement();

  return (
    <div className="pt-16 md:pt-24" data-testid="pricing-page">
      <section className="relative mx-auto max-w-7xl px-4 md:px-8">
        <DotsArc className="pointer-events-none absolute right-4 top-0 hidden w-28 text-lime lg:block" />
        <Reveal>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="mr-3 inline-flex items-center gap-1 align-middle" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-lime" />
              <span className="h-2 w-2 rounded-full bg-foreground/50" />
            </span>
            {t("nav.pricing")}
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
            {t("pricing.title")}
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">{t("pricing.subtitle")}</p>
          <p className="mt-8 inline-flex items-center gap-2 border border-lime bg-lime/10 px-4 py-2 text-sm font-medium" data-testid="pricing-money-back">
            <ShieldCheck className="h-4 w-4" /> {t("pricing.moneyBack")}
          </p>
        </Reveal>
      </section>

      <SectionDivider className="mt-16" background="hsl(var(--background))" fill="hsl(var(--card))" variant="arc" />

      <section className="bg-card pb-8 pt-4">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <PricingCards />
        </div>
      </section>

      <SectionDivider background="hsl(var(--card))" fill="hsl(var(--foreground))" variant="dip" />

      <section className="bg-foreground py-16 text-background md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/50">{t("benefits.eyebrow")}</p>
              <h2 className="mt-3 font-display text-3xl font-medium md:text-5xl">{t("pricing.allInclude")}</h2>
            </div>
            <DoodleBand className="hidden opacity-80 md:flex" />
          </div>
          <ul className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="pricing-all-include">
            {(engagement?.pricing.allInclude ?? []).map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <li className="flex items-center gap-3 border-b border-background/15 py-4 text-base">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime">
                    <Check className="h-4 w-4 text-lime-foreground" />
                  </span>
                  {tt(item)}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <SectionDivider background="hsl(var(--foreground))" fill="hsl(var(--background))" variant="hill" flip />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-8 border border-dashed border-border bg-card p-8 md:p-12" data-testid="pricing-custom">
            <div className="max-w-lg">
              <h2 className="font-display text-3xl font-medium md:text-4xl">{tt(engagement?.pricing.customTitle)}</h2>
              <p className="mt-3 text-muted-foreground">{tt(engagement?.pricing.customBody)}</p>
            </div>
            <ConsultButtons />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
        <div className="max-w-3xl">
          <FaqList items={engagement?.faq ?? []} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 text-center md:px-8">
        <Reveal>
          <h2 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{tt(engagement?.pricing.customTitle)}</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">{t("pricing.subtitle")}</p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href="/contact"
              data-testid="pricing-contact-cta"
              className="inline-flex h-12 items-center rounded-none bg-foreground px-8 text-sm font-semibold text-background hover:bg-foreground/85"
            >
              {t("contact.form.title")}
            </Link>
            <ConsultButtons />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
