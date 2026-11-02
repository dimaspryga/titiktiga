import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  action,
  icon,
  className,
  testId,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId ?? "empty-state"}
      className={cn("flex flex-col items-center justify-center gap-4 px-6 py-20 text-center", className)}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted/50">
        {icon ?? <PackageOpen className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="font-display text-2xl font-medium md:text-3xl">{title}</h3>
      {body && <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>}
      {action}
    </div>
  );
}
