"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { AboutVideo } from "@/components/about-video";
import { CountUp, ParallaxImg, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t, tt } = useI18n();
  const { data: content } = useContent();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24" data-testid="about-page">
      <Reveal>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="mr-3 inline-flex items-center gap-1 align-middle" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-lime" />
            <span className="h-2 w-2 rounded-full bg-foreground/50" />
          </span>
          {t("about.eyebrow")}
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          {t("about.title")}
        </h1>
      </Reveal>

      {(content?.aboutPage.videoUrl || content?.aboutPage.videoPoster) && (
        <Reveal className="mt-10 md:mt-16">
          <section className="relative overflow-hidden bg-black aspect-video" data-testid="about-intro-video">
            {content.aboutPage.videoUrl ? (
              <AboutVideo src={content.aboutPage.videoUrl} poster={content.aboutPage.videoPoster} caption="Putar video studio" />
            ) : (
              <ParallaxImg src={content.aboutPage.videoPoster ?? ""} alt="Video intro Titiktiga" className="h-full w-full" range={5} />
            )}
          </section>
        </Reveal>
      )}

      <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="font-display text-3xl font-medium md:text-4xl">{t("about.story.title")}</h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
              {(content?.aboutPage.story ?? []).map((para, i) => (
                <p key={i}>{tt(para)}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="texture-grain relative mt-10 aspect-[16/9] overflow-hidden">
              <ParallaxImg src={content?.aboutPage.images[0] ?? ""} alt="Titiktiga studio" className="h-full w-full" range={6} />
            </div>
          </Reveal>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <Reveal delay={0.15}>
            <div className="border border-border bg-card p-8" data-testid="about-vision">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("about.vision.title")}
              </h3>
              <p className="mt-4 font-display text-2xl leading-snug">{tt(content?.aboutPage.vision)}</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="border border-border bg-card p-8" data-testid="about-mission">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("about.mission.title")}
              </h3>
              <ul className="mt-4 space-y-3">
                {(content?.aboutPage.mission ?? []).map((m, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    {tt(m)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-16 md:mt-24">
        <div className="texture-grain relative aspect-[21/9] overflow-hidden">
          <ParallaxImg src={content?.aboutPage.images[1] ?? ""} alt="Proses cetak Titiktiga" className="h-full w-full" range={8} />
        </div>
      </Reveal>

      <div className="mt-16 md:mt-24">
        <Reveal>
          <h2 className="font-display text-3xl font-medium md:text-4xl">{t("about.philosophy.title")}</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{tt(content?.aboutPage.philosophy)}</p>
        </Reveal>
      </div>

      <div className="mt-16 border-t border-border md:mt-24">
        <p className="pt-10 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("about.stats.title")}
        </p>
        <Stagger className="mt-6 grid grid-cols-2 gap-px md:grid-cols-4">
          {(content?.stats ?? []).map((stat) => (
            <StaggerItem key={stat.id} className="py-8 pr-6">
              <p className="font-display text-5xl font-medium md:text-6xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{tt(stat.label)}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <Reveal className="mt-16 text-center md:mt-24">
        <Button asChild className="h-13 rounded-none bg-foreground px-10 text-base text-background hover:bg-foreground/85" data-testid="about-contact-cta">
          <Link href="/contact" className="h-13">{tt(content?.cta.button)}</Link>
        </Button>
      </Reveal>
    </div>
  );
}
