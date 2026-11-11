"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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

      <div className="mt-16 space-y-5 md:mt-24 md:space-y-6">
        {isLoading &&
          [0, 1, 2, 3, 4].map((i) => <div key={i} className="mt-8 h-28 animate-pulse border-t border-border bg-muted/40" />)}
        {(services ?? []).map((service, serviceIndex) => (
          <Reveal key={service.id}>
            <article className="group relative isolate min-h-[520px] overflow-hidden border border-border bg-foreground text-background md:min-h-[410px]" data-testid={`service-card-${service.slug}`}>
              <SafeImage
                src={service.image || "/uploads/c22fa21c-bd35-45eb-9afe-3e35271c5f50.png"}
                alt={tt(service.title)}
                fill
                sizes="100vw"
                className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                fallbackLabel=""
              />
              <div className={`absolute inset-0 ${serviceIndex % 2 === 0 ? "bg-gradient-to-r from-black/95 via-black/75 to-black/10" : "bg-gradient-to-l from-black/95 via-black/75 to-black/10"}`} />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.35),transparent_55%)]" />
              <div className={`relative flex min-h-[520px] items-end md:min-h-[410px] ${serviceIndex % 2 === 1 ? "md:justify-end" : ""}`}>
                <div className={`m-4 max-w-[680px] border border-white/15 bg-black/55 p-6 backdrop-blur-md md:m-8 md:p-8 lg:p-10 ${serviceIndex % 2 === 1 ? "md:mr-10 lg:mr-16" : "md:ml-10 lg:ml-16"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/75">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                      Cara {service.index}
                    </span>
                    <Button asChild variant="outline" className="h-10 w-10 shrink-0 rounded-full border-white/30 bg-white/5 text-white hover:bg-lime hover:text-lime-foreground" data-testid={`service-cta-${service.slug}`}>
                      <Link href="/contact" aria-label={t("services.cta")}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <h2 className="mt-5 font-display text-3xl font-medium leading-none tracking-tight md:text-5xl">{tt(service.title)}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">{tt(service.description)}</p>

                  <div className="mt-6 border-t border-white/20 pt-5">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
                      {t("services.deliverables")}
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {service.deliverables.slice(0, 6).map((d, i) => (
                        <li key={i} className="border border-white/15 bg-white/[0.07] px-3 py-2 text-xs text-white/85 md:text-sm">
                          {tt(d)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
                    {t("services.priceFrom")} <span className="ml-2 text-base font-semibold normal-case tracking-normal text-lime">{formatIDR(service.priceFrom)}</span>
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
        <div className="border-t border-border" />
      </div>

    </div>
  );
}
