"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
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
      <section id="overview" className="relative overflow-hidden border-b border-border bg-card/30">
        <DotsArc className="pointer-events-none absolute right-6 top-8 hidden w-24 text-lime lg:block" />
        <div className="mx-auto grid max-w-[90rem] gap-10 px-4 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14 lg:grid-cols-12 lg:items-stretch lg:gap-0">
          <div className="relative z-10 flex flex-col justify-center border-b border-border pb-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:pb-16 lg:pr-10 xl:pr-16">
            <p className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:text-[11px]">
              <span className="inline-flex items-center gap-1" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-lime" />
                <span className="h-2 w-2 rounded-full bg-foreground/60" />
                <span className="h-2 w-2 rounded-full bg-foreground/30" />
              </span>
              {tt(content?.hero.eyebrow)}
            </p>
            <h1 className="font-display text-[clamp(3rem,9.5vw,9rem)] font-medium leading-[0.86] tracking-[-0.055em]">
              {(content?.hero.titleLines ?? []).map((line, i) => (
                <LineMask key={i} delay={0.12 + i * 0.1} innerClassName="pb-2">
                  {i === (content?.hero.titleLines.length ?? 0) - 1 ? (
                    <em className="ml-[0.08em] italic">{tt(line)}</em>
                  ) : (
                    tt(line)
                  )}
                </LineMask>
              ))}
            </h1>
            <Reveal delay={0.7}>
              <p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
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
          <div className="relative flex min-h-[28rem] items-center py-4 lg:col-span-5 lg:py-12 lg:pl-10 xl:pl-16">
            <Reveal delay={0.35} y={40} className="w-full">
              <div className="group/feature relative ml-auto aspect-[4/5] w-full max-w-[34rem] overflow-hidden border border-border bg-muted lg:aspect-[4/5]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-3 z-10 border border-background/35" />
                <ParallaxImg
                  src={content?.hero.image ?? ""}
                  alt={tt(content?.hero.imageAlt)}
                  className="h-full w-full"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                  range={4}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/5 to-transparent opacity-90 transition-opacity duration-500 group-hover/feature:opacity-100" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                  <span className="rounded-full border border-background/40 bg-background/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-foreground backdrop-blur-md">
                    {t("nav.portfolio")}
                  </span>
                  <span className="rounded-full border border-background/40 bg-background/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-foreground backdrop-blur-md">
                    Est. 2018 — Yogyakarta
                  </span>
                </div>
                {works[0] && (
                  <Link
                    href={`/portfolio/${works[0].slug}`}
                    className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 border-t border-background/40 pt-4 text-background sm:inset-x-6 sm:bottom-6"
                    data-testid="hero-featured-work"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-background/70">
                        {tt(works[0].category)} · {works[0].year}
                      </span>
                      <span className="mt-1 block truncate font-display text-2xl font-medium leading-tight sm:text-3xl">
                        {works[0].title}
                      </span>
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-lime-foreground transition-transform duration-200 group-hover/feature:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                )}
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
      <section className="border-b border-border py-5 md:py-7" aria-label="Marquee">
        <MarqueeBand items={(content?.marquee ?? []).map((m) => tt(m))} />
      </section>

      {/* SELECTED WORKS */}
      <section id="works" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow={t("home.works.eyebrow")}
          title={t("home.works.title")}
          action={
            <Link href="/portfolio" className="link-underline flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]" data-testid="home-works-cta">
              {t("home.works.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 md:auto-rows-[18rem] md:grid-cols-12 md:gap-6 xl:auto-rows-[21rem]">
          {works.map((project, i) => (
            <Reveal key={project.id} className={i === 0 ? "md:col-span-7 md:row-span-2" : "md:col-span-5"}>
              <Link href={`/portfolio/${project.slug}`} className="group block" data-testid={`home-work-${project.slug}`}>
                <div className="group/work relative h-full min-h-[16rem] overflow-hidden border border-border bg-muted transition-[border-color] duration-300 group-hover:border-foreground/30">
                  <Image
                    src={project.cover}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 ease-snappy group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/work:opacity-100"
                  />
                  <span className="absolute bottom-4 right-4 inline-flex translate-y-1 items-center gap-2 rounded-full border border-background/50 bg-background/90 px-4 py-2 text-xs font-medium opacity-0 backdrop-blur transition-[opacity,transform] duration-200 group-hover/work:translate-y-0 group-hover/work:opacity-100">
                    {t("product.viewFull")} <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
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

      {/* MARKET */}
      <section id="market" className="scroll-mt-28">
        <div className="mx-auto max-w-7xl px-4 pt-20 md:px-8 md:pt-28">
          <SectionHeading eyebrow={t("home.categories.eyebrow")} title={t("home.categories.title")} />
          <CategoryList categories={featuredCategories} />
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-8 md:pb-28 md:pt-20">
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
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
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

      {/* PRICING TEASER */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32" data-testid="home-pricing-teaser">
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
      <section id="studio" className="scroll-mt-24 bg-card pb-24 pt-4 md:pb-32">
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

      {/* TESTIMONIALS — siluet kurva + marquee */}
      <section className="border-t border-border bg-card pb-24 pt-16 md:pb-32 md:pt-24">
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
      <section id="inquiry" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-24 text-center md:px-8 md:py-36" data-testid="home-cta">
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
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative"
      onMouseLeave={() => setActive(null)}
      onMouseMove={(e) => {
        if (previewRef.current) {
          previewRef.current.style.transform = `translate3d(${e.clientX - 130}px, ${e.clientY - 160}px, 0)`;
        }
      }}
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
          ref={previewRef}
          className="pointer-events-none fixed z-20 hidden lg:block"
          style={{ left: 0, top: 0 }}
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
