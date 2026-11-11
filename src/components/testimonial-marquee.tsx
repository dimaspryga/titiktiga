"use client";

import { SafeImage } from "@/components/safe-image";
import { Marquee } from "@/components/ui/marquee";

export interface TestimonialCardData {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

/** Baris testimoni berjalan dengan Magic UI Marquee. */
export function TestimonialMarquee({
  items,
  speed = 35,
}: {
  items: TestimonialCardData[];
  speed?: number;
}) {
  if (items.length === 0) return null;

  const row = (
    <div className="flex shrink-0 items-stretch">
      {items.map((t) => (
        <figure
          key={t.id}
          className="mx-3 flex w-[320px] flex-col justify-between border border-border bg-background p-7 md:w-[420px]"
          data-testid={`testimonial-card-${t.id}`}
        >
          <blockquote className="font-display text-xl font-normal leading-snug md:text-2xl">
            <span className="text-lime">“</span>
            {t.quote}
            <span className="text-lime">”</span>
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-4">
            <SafeImage src={t.avatar} alt={t.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" fallbackLabel={t.name} />
            <div>
              <p className="text-sm font-semibold" data-testid="testimonial-name">{t.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t.role}</p>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]" data-testid="testimonials-marquee">
      <Marquee
        pauseOnHover
        repeat={3}
        className="[--duration:35s] [--gap:0rem] p-0"
      >
        {row}
      </Marquee>
    </div>
  );
}
