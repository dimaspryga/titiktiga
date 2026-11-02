"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ParallaxImg, Reveal } from "@/components/motion";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolio, usePortfolioProject } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function PortfolioDetailPage() {
  const params = useParams<{ slug: string }>();
  const { t, tt } = useI18n();
  const { data: project, isLoading } = usePortfolioProject(params?.slug);
  const { data: all } = usePortfolio();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 md:px-8">
        <Skeleton className="h-[60vh] w-full" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8" data-testid="portfolio-not-found">
        <EmptyState
          title={t("portfolio.empty")}
          action={
            <Link href="/portfolio" className="font-mono text-xs uppercase tracking-[0.18em] underline">
              {t("portfolio.back")}
            </Link>
          }
        />
      </div>
    );
  }

  const index = (all ?? []).findIndex((p) => p.slug === project.slug);
  const next = (all ?? [])[(index + 1) % Math.max(1, (all ?? []).length)];

  return (
    <article className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24" data-testid="portfolio-detail-page">
      <Reveal>
        <Link href="/portfolio" className="link-underline mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground" data-testid="portfolio-back-link">
          <ArrowLeft className="h-4 w-4" /> {t("portfolio.back")}
        </Link>
        <div className="texture-grain relative aspect-[21/10] overflow-hidden">
          <ParallaxImg src={project.cover} alt={project.title} className="h-full w-full" range={7} priority />
        </div>
      </Reveal>

      <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12">
        <div className="md:col-span-8">
          <h1 className="font-display text-4xl font-medium leading-tight tracking-tight md:text-6xl">{project.title}</h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{tt(project.description)}</p>
        </div>
        <div className="space-y-6 md:col-span-4">
          <div className="border-t border-border pt-4" data-testid="portfolio-meta-client">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("portfolio.client")}</p>
            <p className="mt-1 text-lg font-medium">{project.client}</p>
          </div>
          <div className="border-t border-border pt-4" data-testid="portfolio-meta-year">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("portfolio.year")}</p>
            <p className="mt-1 text-lg font-medium">{project.year}</p>
          </div>
          <div className="border-t border-border pt-4" data-testid="portfolio-meta-services">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("portfolio.services")}</p>
            <ul className="mt-2 space-y-1">
              {project.services.map((s) => (
                <li key={s} className="text-sm">{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-6 md:mt-24">
        {project.images.slice(1).map((img, i) => (
          <Reveal key={i}>
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <Image src={img} alt={`${project.title} — ${i + 2}`} fill sizes="(max-width: 768px) 100vw, 90vw" className="object-cover" />
            </div>
          </Reveal>
        ))}
      </div>

      {next && next.slug !== project.slug && (
        <Reveal className="mt-16 border-t border-border pt-10 md:mt-24">
          <Link href={`/portfolio/${next.slug}`} className="group flex items-center justify-between gap-6" data-testid="portfolio-next-link">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("portfolio.next")}</p>
              <p className="mt-2 font-display text-3xl font-medium md:text-5xl">{next.title}</p>
            </div>
            <ArrowRight className="h-8 w-8 shrink-0 transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </Reveal>
      )}
    </article>
  );
}
