"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { useServices } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";

export default function ServicesPage() {
  const { t, tt } = useI18n();
  const { data: services, isLoading } = useServices();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24" data-testid="services-page">
      <Reveal>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="mr-3 inline-flex items-center gap-1 align-middle" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-lime" />
            <span className="h-2 w-2 rounded-full bg-foreground/50" />
          </span>
          {t("services.eyebrow")}
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          {t("services.title")}
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">{t("services.subtitle")}</p>
      </Reveal>

      <div className="mt-16 md:mt-24">
        {isLoading &&
          [0, 1, 2, 3, 4].map((i) => <div key={i} className="mt-8 h-28 animate-pulse border-t border-border bg-muted/40" />)}
        {(services ?? []).map((service) => (
          <Reveal key={service.id}>
            <article className="grid gap-6 border-t border-border py-10 md:grid-cols-12 md:gap-10" data-testid={`service-card-${service.slug}`}>
              <div className="md:col-span-1">
                <span className="font-mono text-sm text-muted-foreground">{service.index}</span>
              </div>
              <div className="md:col-span-5">
                <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">{tt(service.title)}</h2>
                <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{tt(service.description)}</p>
                <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t("services.priceFrom")} <span className="text-foreground">{formatIDR(service.priceFrom)}</span>
                </p>
              </div>
              <div className="md:col-span-5">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("services.deliverables")}
                </h3>
                <ul className="mt-4 space-y-2">
                  {service.deliverables.map((d, i) => (
                    <li key={i} className="flex items-center gap-3 border-b border-border/60 pb-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                      {tt(d)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-start md:col-span-1 md:justify-end">
                <Button asChild variant="outline" className="rounded-none" data-testid={`service-cta-${service.slug}`}>
                  <Link href="/contact" aria-label={t("services.cta")}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          </Reveal>
        ))}
        <div className="border-t border-border" />
      </div>
    </div>
  );
}
