import { cn } from "@/lib/utils";

const PATHS: Record<string, string> = {
  hill: "M0,84 C240,24 480,116 720,72 C960,28 1200,96 1440,56 L1440,120 L0,120 Z",
  arc: "M0,120 L0,96 Q720,-16 1440,96 L1440,120 Z",
  dip: "M0,44 C360,120 1080,-28 1440,72 L1440,120 L0,120 Z",
};

/**
 * Siluet antar section — kurva lembut dengan palet Titiktiga.
 * `background` = warna section di atas, `fill` = warna section di bawah.
 */
export function SectionDivider({
  fill,
  background,
  variant = "hill",
  flip = false,
  className,
}: {
  fill: string;
  background: string;
  variant?: "hill" | "arc" | "dip";
  flip?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative leading-[0]", className)} style={{ background }} aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={cn("block h-14 w-full md:h-24", flip && "-scale-x-100")}
      >
        <path d={PATHS[variant]} fill={fill} />
      </svg>
      <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: fill }} />
        <span className="h-1.5 w-1.5 rounded-full bg-lime" />
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: fill }} />
      </span>
    </div>
  );
}
