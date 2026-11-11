import { cn } from "@/lib/utils";

export function DotsArc({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 62" fill="none" aria-hidden="true" className={className}>
      <circle cx="22" cy="46" r="11" fill="currentColor" opacity="0.3" />
      <circle cx="60" cy="20" r="15" fill="currentColor" opacity="0.6" />
      <circle cx="98" cy="46" r="11" fill="currentColor" />
    </svg>
  );
}

export function DotGrid({ className, rows = 3, cols = 6 }: { className?: string; rows?: number; cols?: number }) {
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={10 + c * 20}
          cy={10 + r * 20}
          r={r === 1 && c === 3 ? 5 : 3.5}
          fill={r === 1 && c === 3 ? "currentColor" : "currentColor"}
          opacity={r === 1 && c === 3 ? 1 : 0.35}
        />
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${cols * 20} ${rows * 20}`} fill="none" aria-hidden="true" className={className}>
      {dots}
    </svg>
  );
}

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 26" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 13 Q 22 3 42 13 T 82 13 T 122 13 T 162 13 T 198 13"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HalfRings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" aria-hidden="true" className={className}>
      <path d="M10 58 A 25 25 0 0 1 60 58" stroke="currentColor" strokeWidth="5" opacity="0.3" />
      <path d="M25 58 A 18 18 0 0 1 61 58" stroke="currentColor" strokeWidth="5" opacity="0.6" />
      <circle cx="88" cy="46" r="12" fill="currentColor" />
    </svg>
  );
}

export function DoodleBand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-6 text-lime", className)} aria-hidden="true">
      <Squiggle className="h-4 w-28" />
      <DotsArc className="h-8 w-16" />
      <HalfRings className="h-8 w-16" />
    </div>
  );
}
