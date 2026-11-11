"use client";

import Link from "next/link";
import { ArrowUpRight, Expand, Star } from "lucide-react";
import { PriceTag } from "@/components/price";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { SafeImage } from "@/components/safe-image";
import { useI18n } from "@/lib/i18n";
import { useCategories } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const { t, tt } = useI18n();
  const { data: categories } = useCategories();
  const catName = tt(categories?.find((c) => c.slug === product.category)?.name);
  const out = product.stock <= 0;

  return (
    <article className={cn("group relative flex flex-col", className)} data-testid={`product-card-${product.slug}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} data-testid={`product-card-link-${product.slug}`} aria-label={product.name} className="absolute inset-0 block">
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            fallbackLabel={product.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-snappy group-hover:scale-[1.04]"
          />
        </Link>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(198,245,62,0.16) 0%, transparent 60%)" }}
        />
        {product.discountPercent != null && product.discountPercent > 0 && !out && (
          <span
            data-testid={`product-discount-badge-${product.slug}`}
            className="absolute left-3 top-3 bg-lime px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-lime-foreground"
          >
            -{product.discountPercent}%
          </span>
        )}
        {out && (
          <span
            data-testid={`product-out-badge-${product.slug}`}
            className="absolute left-3 top-3 bg-foreground px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-background"
          >
            {t("availability.outStock")}
          </span>
        )}
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/products/${product.slug}`}
          aria-label={`${t("product.viewFull")} ${product.name}`}
          className="absolute bottom-3 right-3 flex h-9 items-center gap-2 bg-background/80 px-3 text-xs font-medium backdrop-blur-md transition-colors hover:bg-background/95"
        >
          <Expand className="h-4 w-4" /> {t("product.viewFull")}
        </Link>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{catName || product.category}</p>
        <h3 className="mt-1 font-display text-xl font-medium leading-snug">
          <Link href={`/products/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>
        {product.rating != null && product.rating > 0 && !out && (
          <div data-testid={`product-rating-${product.slug}`} className="mt-2 flex items-center gap-2 font-mono text-[11px]" aria-label={`${t("product.rating")} ${product.rating.toFixed(1)} / 5`}>
            <span className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`h-3 w-3 ${product.rating! >= i + 0.75 ? "fill-lime text-lime" : product.rating! >= i + 0.25 ? "fill-lime/50 text-lime" : "text-muted-foreground/40"}`} />
              ))}
            </span>
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceTag price={product.price} discountPercent={product.discountPercent} />
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
