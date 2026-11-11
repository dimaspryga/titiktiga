"use client";

import Marquee from "react-fast-marquee";
import { cn } from "@/lib/utils";

/**
 * Band marquee teks besar (react-fast-marquee) — menggantikan marquee CSS
 * buatan sendiri agar bergerak mulus, berhenti saat hover, dan mengisi lebar.
 */
export function MarqueeBand({
  items,
  className,
  speed = 55,
  delay = 0,
  loop = 0,
}: {
  items: string[];
  className?: string;
  speed?: number;
  delay?: number;
  loop?: number;
}) {
  if (items.length === 0) return null;

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-4xl font-medium italic md:px-8 md:text-6xl">{item}</span>
          <span className="inline-flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-lime" />
            <span className="h-2 w-2 rounded-full bg-foreground/70" />
            <span className="h-2 w-2 rounded-full bg-foreground/30" />
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)} role="marquee" aria-label={items.join(", ")} data-testid="marquee-band">
      <Marquee
        play={true}
        direction="left"
        speed={speed}
        delay={delay}
        loop={loop}
        gradient
        gradientColor="var(--background)"
        gradientWidth={48}
        pauseOnHover
        autoFill
        className="marquee-runtime"
      >
        {row}
      </Marquee>
    </div>
  );
}
