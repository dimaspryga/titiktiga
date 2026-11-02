import { cn } from "@/lib/utils";
import { unitPrice } from "@/lib/services/pricing";
import { formatIDR } from "@/lib/utils";

export function PriceTag({
  price,
  discountPercent,
  className,
  size = "md",
}: {
  price: number;
  discountPercent?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const effective = unitPrice(price, discountPercent);
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)} data-testid="price-tag">
      <span
        className={cn(
          "font-semibold tracking-tight",
          size === "lg" && "text-2xl md:text-3xl",
          size === "md" && "text-base md:text-lg",
          size === "sm" && "text-sm"
        )}
      >
        {formatIDR(effective)}
      </span>
      {discountPercent != null && discountPercent > 0 && (
        <s className={cn("text-muted-foreground", size === "lg" ? "text-base" : "text-xs sm:text-sm")}>
          {formatIDR(price)}
        </s>
      )}
    </span>
  );
}
