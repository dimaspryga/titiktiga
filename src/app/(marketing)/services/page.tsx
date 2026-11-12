"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { useServices } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";
import { SafeImage } from "@/components/safe-image";

export default function ServicesPage() {
  const { t, tt } = useI18n();
  const { data: services, isLoading } = useServices();

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-12 md:px-8 md:py-20" data-testid="services-page">
      <div className="grid gap-12 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <div className="border-t border-border pt-6">
            <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="inline-flex items-center gap-1" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-lime" />
                <span className="h-2 w-2 rounded-full bg-foreground/50" />
              </span>
              {t("services.eyebrow")}
            </p>
            <h1 className="max-w-2xl font-display text-5xl font-medium leading-[0.94] tracking-tight md:text-7xl">
              {t("services.title")}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("services.subtitle")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 items-center gap-3 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
              data-testid="services-contact-cta"
            >
              {t("services.cta")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="border-t border-border">
          {isLoading &&
            [0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse border-b border-border bg-muted/40" />
            ))}
          {(services ?? []).map((service, serviceIndex) => (
            <Reveal key={service.id}>
              <details
                open={serviceIndex === 0}
                className="group border-b border-border"
                data-testid={`service-card-${service.slug}`}
              >
                <summary className="flex min-h-24 cursor-pointer list-none items-center gap-4 py-5 outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-ring md:gap-6 md:py-7 [&::-webkit-details-marker]:hidden">
                  <span className="font-mono text-xs text-muted-foreground md:text-sm">{service.index}</span>
                  <span className="flex-1 font-display text-2xl font-medium leading-tight tracking-tight transition-transform duration-300 group-hover:translate-x-1 md:text-4xl">
                    {tt(service.title)}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="grid gap-6 bg-transparent pb-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-8 md:pb-10">
                  <div className="relative aspect-[4/3] overflow-hidden border border-border bg-muted">
                    <SafeImage
                      src={service.image || "/uploads/c22fa21c-bd35-45eb-9afe-3e35271c5f50.png"}
                      alt={tt(service.title)}
                      fill
                      sizes="(max-width: 768px) 100vw, 35vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                      fallbackLabel=""
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Cara {service.index}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {tt(service.description)}
                    </p>
                    <div className="mt-6 border-t border-border pt-5">
                      <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {t("services.deliverables")}
                      </h3>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {service.deliverables.map((deliverable, i) => (
                          <li
                            key={`${service.id}-${i}`}
                            className="rounded-full border border-border/70 bg-transparent px-3 py-2 text-xs md:text-sm"
                          >
                            {tt(deliverable)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {t("services.priceFrom")}
                        <span className="mt-1 block font-sans text-xl font-semibold normal-case tracking-normal text-foreground">
                          {formatIDR(service.priceFrom)}
                        </span>
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-full px-5"
                        data-testid={`service-cta-${service.slug}`}
                      >
                        <Link href="/contact" aria-label={`${t("services.cta")}: ${tt(service.title)}`}>
                          {t("services.cta")} <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
