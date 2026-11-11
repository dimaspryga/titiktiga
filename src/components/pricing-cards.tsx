"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/consult-buttons";
import { useEngagement, whatsappUrlFor } from "@/lib/repositories/engagement";
import { useI18n } from "@/lib/i18n";
import { computePeriodicPrice } from "@/lib/services/pricing";
import { cn, formatIDR } from "@/lib/utils";

export function PricingCards() {
  const { t, tt } = useI18n();
  const { data: engagement } = useEngagement();
  const periods = engagement?.pricing.periods ?? [];
  const tiers = engagement?.pricing.tiers ?? [];
  const [selectedId, setSelectedId] = useState<string>("per-1");
  const period = periods.find((p) => p.id === selectedId) ?? periods[0];

  return (
    <div>
      <div className="mb-12 flex flex-col items-center gap-3" data-testid="pricing-period-toggle">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("pricing.periodLabel")}
        </p>
        <div role="group" className="flex items-center rounded-full border border-border bg-card p-1">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              data-testid={`pricing-toggle-${p.id}`}
              aria-pressed={p.id === selectedId}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6",
                p.id === selectedId ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tt(p.label)}
              {p.discountPercent > 0 && (
                <span className="ml-2 hidden font-mono text-[10px] text-lime sm:inline">−{p.discountPercent}%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch" data-testid="pricing-tiers">
        {tiers.map((tier) => {
          const price = computePeriodicPrice(tier.monthlyPrice, period?.discountPercent ?? 0);
          return (
            <article
              key={tier.id}
              data-testid={`pricing-tier-${tier.id}`}
              className={cn(
                "relative flex flex-col border bg-card p-8",
                tier.highlighted ? "border-lime border-2 shadow-[0_18px_50px_-30px_hsl(var(--lime))]" : "border-border"
              )}
            >
              {tier.highlighted && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-lime px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-lime-foreground"
                  data-testid={`pricing-popular-${tier.id}`}
                >
                  {t("pricing.popular")}
                </span>
              )}
              <h3 className="font-display text-3xl font-medium">{tier.name}</h3>
              <p className="mt-2 min-h-10 text-sm text-muted-foreground">{tt(tier.tagline)}</p>

              <div className="mt-6 border-t border-border pt-6">
                <motion.p
                  key={`${tier.id}-${period?.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-1"
                  data-testid={`pricing-price-${tier.id}`}
                >
                  <span className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                    {formatIDR(price)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{t("pricing.perMonth")}</span>
                </motion.p>
                {(period?.discountPercent ?? 0) > 0 ? (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <s className="mr-2">{formatIDR(tier.monthlyPrice)}</s>
                    <span className="font-semibold text-foreground">
                      {t("pricing.saving", { percent: period?.discountPercent ?? 0 })}
                    </span>
                  </p>
                ) : null}
                {(period?.discountPercent ?? 0) > 0 && (
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {t("pricing.billedNote", { months: period?.months ?? 1 })}
                  </p>
                )}
              </div>

              <ul className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-foreground" /> {t("pricing.projects", { count: tier.parallelProjects })}
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-foreground" /> {tt(tier.brands)}
                </li>
              </ul>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {t("pricing.includes")}
              </p>
              <ul className="mt-3 flex-1 space-y-2 text-sm">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                    {tt(feature)}
                  </li>
                ))}
              </ul>

              <a
                href={whatsappUrlFor(`Halo Titiktiga, saya tertarik dengan paket ${tier.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`pricing-cta-${tier.id}`}
                className={cn(
                  "mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-none text-sm font-semibold transition-colors",
                  tier.highlighted
                    ? "bg-lime text-lime-foreground hover:bg-lime/85"
                    : "border border-foreground text-foreground hover:bg-foreground hover:text-background"
                )}
              >
                <WhatsAppIcon className="h-4 w-4" /> {t("consult.label")}
              </a>
            </article>
          );
        })}
      </div>
    </div>
  );
}
