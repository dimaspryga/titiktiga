"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CountUp, LineMask, Magnetic, ParallaxImg, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { MarqueeBand } from "@/components/marquee-band";
import { TestimonialMarquee } from "@/components/testimonial-marquee";
import { SectionDivider } from "@/components/section-divider";
import { ConsultButtons } from "@/components/consult-buttons";
import { DotsArc, Squiggle } from "@/components/doodles";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useCategories, useContent, usePortfolio, useProducts, usePromotions, useServices, useTestimonials, useEngagement } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { computePeriodicPrice } from "@/lib/services/pricing";
import { formatIDR } from "@/lib/utils";

export default function HomePage() {
  const { t, tt } = useI18n();
  const { data: content } = useContent();
  const { data: products } = useProducts({});
  const { data: categories } = useCategories();
  const { data: portfolio } = usePortfolio();
  const { data: services } = useServices();
  const { data: testimonials } = useTestimonials();
  const { data: promotions } = usePromotions();
  const { data: engagement } = useEngagement();

  const featured = (content?.featuredProductIds ?? [])
    .map((id) => products?.items.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const featuredCategories = (content?.featuredCategorySlugs ?? [])
    .map((slug) => categories?.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const works = (portfolio ?? []).slice(0, 3);
  const banner = promotions?.find((p) => p.placement === "home-banner" && p.active);
  const tiers = (engagement?.pricing.tiers ?? []).slice(0, 3);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <DotsArc className="pointer-events-none absolute right-6 top-8 hidden w-24 text-lime lg:block" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 md:px-8 md:pt-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="inline-flex items-center gap-1" aria-hidden="true">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-pulse rounded-full bg-foreground/60" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-pulse rounded-full bg-foreground/30" style={{ animationDelay: "300ms" }} />
              </span>
              {tt(content?.hero.eyebrow)}
            </p>
            <h1 className="font-display text-[13vw] font-medium leading-[0.95] tracking-tight sm:text-6xl md:text-7xl xl:text-8xl">
              {(content?.hero.titleLines ?? []).map((line, i) => (
                <LineMask key={i} delay={0.15 + i * 0.14} innerClassName="pb-1">
                  {i === (content?.hero.titleLines.length ?? 0) - 1 ? (
                    <em className="italic">{tt(line)}</em>
                  ) : (
                    tt(line)
                  )}
                </LineMask>
              ))}
            </h1>
            <Reveal delay={0.7}>
              <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                {tt(content?.hero.subtitle)}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Magnetic>
                  <Button asChild className="h-12 rounded-none bg-lime px-8 text-base font-semibold text-lime-foreground hover:bg-lime/85" data-testid="hero-cta-products">
                    <Link href="/products" className="h-12 items-center gap-2 text-base">
                      {t("hero.ctaProducts")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button asChild variant="outline" className="h-12 rounded-none px-8 text-base" data-testid="hero-cta-portfolio">
                    <Link href="/portfolio" className="h-12 items-center text-base">
                      {t("hero.ctaPortfolio")}
                    </Link>
                  </Button>
                </Magnetic>
              </div>
            </Reveal>
          </div>
          <div className="relative lg:col-span-5">
            <Reveal delay={0.35} y={40}>
              <div className="relative ml-auto aspect-[3/4] max-w-md lg:max-w-none">
                <div aria-hidden="true" className="absolute -left-4 -top-4 h-full w-full border border-lime" />
                <ParallaxImg
                  src={content?.hero.image ?? ""}
                  alt={tt(content?.hero.imageAlt)}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <p className="absolute -bottom-5 left-6 bg-foreground px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-background">
                  Est. 2018 — Yogyakarta
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {banner && (
          <Reveal delay={0.9} className="mx-auto max-w-7xl px-4 md:px-8">
            <Link
              href="/products"
              data-testid="home-promo-banner"
              className="group flex items-center justify-between gap-4 border border-lime bg-lime/10 px-4 py-3 transition-colors hover:bg-lime/20"
            >
              <p className="text-sm font-medium">
                {tt(banner.title)}{" "}
                {banner.code && (
                  <span className="ml-1 bg-lime px-2 py-0.5 font-mono text-xs font-bold text-lime-foreground">
                    {banner.code}
                  </span>
                )}
              </p>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        )}

        <div className="mx-auto mt-16 max-w-7xl border-t border-border px-4 md:px-8" data-testid="home-stats">
          <Stagger className="grid grid-cols-2 gap-px md:grid-cols-4">
            {(content?.stats ?? []).map((stat) => (
              <StaggerItem key={stat.id} className="px-2 py-8 md:px-6">
                <p className="font-display text-5xl font-medium md:text-6xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {tt(stat.label)}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-b border-border py-8 md:py-10" aria-label="Marquee">
        <MarqueeBand items={(content?.marquee ?? []).map((m) => tt(m))} />
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <SectionHeading eyebrow={t("home.categories.eyebrow")} title={t("home.categories.title")} />
        <CategoryList categories={featuredCategories} />
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8 md:pb-32">
        <SectionHeading
          eyebrow={t("home.products.eyebrow")}
          title={t("home.products.title")}
          action={
            <Link href="/products" className="link-underline flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]" data-testid="home-products-cta">
              {t("home.products.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <Stagger className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <StaggerItem key={product.id} className="h-full">
              <ProductCard product={product} className="h-full" />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* PRICING TEASER */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32" data-testid="home-pricing-teaser">
          <SectionHeading
            eyebrow={t("home.pricing.eyebrow")}
            title={t("home.pricing.title")}
            action={
              <Link href="/pricing" className="link-underline flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]" data-testid="home-pricing-cta">
                {t("home.pricing.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <Stagger className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <StaggerItem key={tier.id} className="h-full">
                <Link
                  href="/pricing"
                  data-testid={`home-pricing-tier-${tier.id}`}
                  className="group flex h-full flex-col border border-border bg-card p-8 transition-colors hover:border-lime"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-medium">{tier.name}</h3>
                    {tier.highlighted && (
                      <span className="bg-lime px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-lime-foreground">
                        {t("pricing.popular")}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tt(tier.tagline)}</p>
                  <p className="mt-6 font-display text-3xl font-semibold tracking-tight">
                    {formatIDR(computePeriodicPrice(tier.monthlyPrice, 0))}
                    <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">{t("pricing.perMonth")}</span>
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                    {t("pricing.custom.cta")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ABOUT PREVIEW — siluet kurva */}
      <SectionDivider background="hsl(var(--background))" fill="hsl(var(--card))" variant="hill" />
      <section className="bg-card pb-24 pt-4 md:pb-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="texture-grain relative aspect-[4/3] overflow-hidden">
              <ParallaxImg src={content?.aboutPreview.image ?? ""} alt={tt(content?.aboutPreview.title)} className="h-full w-full" range={6} />
              <Squiggle className="absolute -bottom-3 right-4 h-5 w-32 text-lime" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {tt(content?.aboutPreview.eyebrow)}
            </p>
            <h2 className="font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">
              {tt(content?.aboutPreview.title)}
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">{tt(content?.aboutPreview.body)}</p>
            <Button asChild variant="outline" className="mt-8 h-12 rounded-none px-8" data-testid="home-about-cta">
              <Link href="/about">{t("nav.about")}</Link>
            </Button>
          </Reveal>
        </div>
      </section>
      <SectionDivider background="hsl(var(--card))" fill="hsl(var(--background))" variant="dip" flip />

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <SectionHeading
          eyebrow={t("home.services.eyebrow")}
          title={t("home.services.title")}
          action={
            <Link href="/services" className="link-underline flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]" data-testid="home-services-cta">
              {t("home.services.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div>
          {(services ?? []).map((service) => (
            <Reveal key={service.id}>
              <Link
                href="/services"
                data-testid={`home-service-row-${service.slug}`}
                className="group flex items-baseline gap-6 border-t border-border py-6 transition-colors last:border-b hover:bg-lime/10 md:gap-10 md:py-8"
              >
                <span className="font-mono text-xs text-muted-foreground md:text-sm">{service.index}</span>
                <span className="font-display text-2xl font-medium tracking-tight transition-transform duration-500 ease-snappy group-hover:translate-x-2 md:text-4xl">
                  {tt(service.title)}
                </span>
                <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SELECTED WORKS */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8 md:pb-32">
        <SectionHeading
          eyebrow={t("home.works.eyebrow")}
          title={t("home.works.title")}
          action={
            <Link href="/portfolio" className="link-underline flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]" data-testid="home-works-cta">
              {t("home.works.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-12">
          {works.map((project, i) => (
            <Reveal key={project.id} className={i === 0 ? "md:col-span-7" : i === 1 ? "md:col-span-5" : "md:col-span-12"}>
              <Link href={`/portfolio/${project.slug}`} className="group block" data-testid={`home-work-${project.slug}`}>
                <div className={`relative overflow-hidden ${i === 2 ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
                  <Image
                    src={project.cover}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 ease-snappy group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-4 pt-4">
                  <h3 className="font-display text-2xl font-medium md:text-3xl">{project.title}</h3>
                  <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {project.client} — {project.year}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — siluet kurva + marquee */}
      <SectionDivider background="hsl(var(--background))" fill="hsl(var(--card))" variant="dip" />
      <section className="bg-card pb-24 pt-4 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading eyebrow={t("home.testimonials.eyebrow")} title={t("home.testimonials.title")} />
        </div>
        <div className="mt-14">
          <TestimonialMarquee
            items={(testimonials ?? []).map((tst) => ({
              id: tst.id,
              quote: tt(tst.quote),
              name: tst.name,
              role: tt(tst.role),
              avatar: tst.avatar,
            }))}
          />
        </div>
      </section>
      <SectionDivider background="hsl(var(--card))" fill="hsl(var(--background))" variant="hill" flip />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-8 md:py-36" data-testid="home-cta">
        <Reveal>
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="mr-3 inline-flex items-center gap-1 align-middle" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-lime" />
              <span className="h-2 w-2 rounded-full bg-foreground/50" />
              <span className="h-2 w-2 rounded-full bg-foreground/25" />
            </span>
            {t("nav.contact")}
          </p>
          <h2 className="mx-auto max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
            {tt(content?.cta.title)}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-muted-foreground">{tt(content?.cta.subtitle)}</p>
          <Magnetic strength={0.3} className="mt-10">
            <Button asChild className="h-14 rounded-full bg-foreground px-10 text-base font-semibold text-background hover:bg-foreground/85" data-testid="home-cta-button">
              <Link href="/contact">{tt(content?.cta.button)}</Link>
            </Button>
          </Magnetic>
          <div className="mt-8 flex justify-center">
            <ConsultButtons />
          </div>
          <Squiggle className="mx-auto mt-10 h-4 w-40 text-lime" />
        </Reveal>
      </section>
    </div>
  );
}

function CategoryList({ categories }: { categories: import("@/lib/types").Category[] }) {
  const { tt } = useI18n();
  const [active, setActive] = useState<import("@/lib/types").Category | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      className="relative"
      onMouseLeave={() => setActive(null)}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {categories.map((category, i) => (
        <Reveal key={category.id}>
          <Link
            href={`/categories/${category.slug}`}
            data-testid={`home-category-${category.slug}`}
            onMouseEnter={() => setActive(category)}
            className="group flex items-center justify-between gap-6 border-t border-border py-6 transition-colors last:border-b hover:bg-lime/10 md:py-8"
          >
            <div className="flex items-baseline gap-6 md:gap-10">
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              <span className="font-display text-3xl font-medium tracking-tight transition-transform duration-500 ease-snappy group-hover:translate-x-2 md:text-5xl">
                {tt(category.name)}
              </span>
            </div>
            <p className="hidden max-w-xs text-sm text-muted-foreground md:block">{tt(category.description)}</p>
            <Image
              src={category.image}
              alt=""
              width={88}
              height={88}
              className="h-16 w-16 shrink-0 object-cover md:hidden"
            />
            <ArrowUpRight className="hidden h-6 w-6 shrink-0 transition-colors group-hover:text-foreground md:block" />
          </Link>
        </Reveal>
      ))}
      {active && (
        <div
          className="pointer-events-none fixed z-20 hidden lg:block"
          style={{ left: pos.x - 130, top: pos.y - 160 }}
          aria-hidden="true"
        >
          <Image
            src={active.image}
            alt=""
            width={300}
            height={360}
            className="h-[320px] w-[260px] border-4 border-lime object-cover shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
