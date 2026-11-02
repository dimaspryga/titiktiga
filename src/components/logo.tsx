import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 16" fill="none" aria-hidden="true" className={cn("h-4 w-11", className)}>
      <circle cx="8" cy="8" r="6" className="fill-foreground" />
      <circle cx="22" cy="8" r="6" className="fill-foreground" />
      <circle cx="36" cy="8" r="6" className="fill-lime" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <LogoMark className={cn("relative top-0.5", markClassName)} />
      <span className="font-display text-2xl font-semibold lowercase tracking-tight">
        titiktiga<span className="text-lime">.</span>
      </span>
    </span>
  );
}
