"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { EmptyState } from "@/components/empty-state";
import { usePortfolio } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function PortfolioPage() {
  const { t, tt } = useI18n();
  const { data: projects, isLoading } = usePortfolio();

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

      {isLoading && <div className="mt-16 h-96 animate-pulse bg-muted/40" />}

      {!isLoading && (projects ?? []).length === 0 && (
        <EmptyState title={t("portfolio.empty")} className="mt-16" />
      )}

      <div className="mt-16 grid gap-x-6 gap-y-16 md:mt-24 md:grid-cols-2">
        {(projects ?? []).map((project, i) => (
          <Reveal key={project.id} className={i % 2 === 1 ? "md:mt-24" : ""}>
            <Link href={`/portfolio/${project.slug}`} className="group block" data-testid={`portfolio-card-${project.slug}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={project.cover}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-snappy group-hover:scale-[1.04]"
                />
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
