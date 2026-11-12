"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/motion";
import { EmptyState } from "@/components/empty-state";
import { usePortfolio } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function PortfolioPage() {
  const { t, tt } = useI18n();
  const { data: projects, isLoading } = usePortfolio();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = [...new Set((projects ?? []).map((project) => tt(project.category)))];
  const visibleProjects = activeCategory
    ? (projects ?? []).filter((project) => tt(project.category) === activeCategory)
    : projects ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24" data-testid="portfolio-page">
      <Reveal>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="mr-3 inline-flex items-center gap-1 align-middle" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-lime" />
            <span className="h-2 w-2 rounded-full bg-foreground/50" />
          </span>
          {t("portfolio.eyebrow")}
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          {t("portfolio.title")}
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">{t("portfolio.subtitle")}</p>
      </Reveal>

      {!isLoading && categories.length > 0 && (
        <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto border-y border-border py-3" role="group" aria-label={t("filters.category")}>
          {[null, ...categories].map((category, index) => {
            const active = activeCategory === category;
            const label = category ?? (t("admin.filter.status") === "All statuses" ? "All" : "Semua");
            return (
              <button
                key={category ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {index === 0 ? label : category}
              </button>
            );
          })}
        </div>
      )}

      {isLoading && <div className="mt-16 h-96 animate-pulse bg-muted/40" />}

      {!isLoading && (projects ?? []).length === 0 && (
        <EmptyState title={t("portfolio.empty")} className="mt-16" />
      )}

      <div className="mt-10 grid gap-x-5 gap-y-12 md:mt-16 md:grid-cols-12 md:gap-x-6 md:gap-y-16">
        {visibleProjects.map((project, i) => (
          <Reveal
            key={project.id}
            className={i % 3 === 0 ? "md:col-span-7" : i % 3 === 1 ? "md:col-span-5 md:mt-20" : "md:col-span-6"}
          >
            <Link
              href={`/portfolio/${project.slug}`}
              className="group block"
              data-testid={`portfolio-card-${project.slug}`}
            >
              <div className="group/image relative aspect-[4/3] overflow-hidden border border-border bg-muted transition-[border-color] duration-300 hover:border-foreground/30">
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-snappy group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/image:opacity-100"
                />
                <span className="absolute bottom-4 right-4 inline-flex translate-y-1 items-center gap-2 rounded-full border border-background/50 bg-background/90 px-4 py-2 text-xs font-medium opacity-0 backdrop-blur transition-[opacity,transform] duration-200 group-hover/image:translate-y-0 group-hover/image:opacity-100">
                  {t("product.viewFull")}
                  <span aria-hidden="true">↗</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-4">
                <h2 className="font-display text-2xl font-medium md:text-3xl">{project.title}</h2>
                <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {tt(project.category)} — {project.year}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
