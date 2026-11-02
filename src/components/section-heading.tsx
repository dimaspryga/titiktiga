import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Reveal className={cn("mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14", className)}>
      <div>
        <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-flex items-center gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
          </span>
          {eyebrow}
        </p>
        <Tag className="font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl">{title}</Tag>
      </div>
      {action}
    </Reveal>
  );
}
