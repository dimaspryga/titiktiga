"use client";

import Link from "next/link";
import { ArrowUpRight, Expand, Star } from "lucide-react";
import { PriceTag } from "@/components/price";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductMedia } from "@/components/product-media";
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
  const rating = product.rating ?? 0;
  const hasRating = rating > 0 && !out;

  return (
    <article className={cn("group relative flex h-full min-w-0 flex-col", className)} data-testid={`product-card-${product.slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden border border-border bg-muted transition-[border-color] duration-300 group-hover:border-foreground/30">
        <Link href={`/products/${product.slug}`} data-testid={`product-card-link-${product.slug}`} aria-label={product.name} className="absolute inset-0 block">
          <ProductMedia
            src={product.images[0]}
            alt={product.name}
            fill
            autoPlay
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-snappy group-hover:scale-[1.03]"
          />
        </Link>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
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
          className="absolute bottom-3 right-3 flex h-9 translate-y-1 items-center gap-2 rounded-full border border-background/50 bg-background/90 px-4 text-xs font-medium opacity-0 backdrop-blur-md transition-[opacity,transform,background-color] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 hover:bg-background"
        >
          <Expand className="h-4 w-4" /> {t("product.viewFull")}
        </Link>
      </div>
      <div className="flex flex-1 flex-col border-x border-b border-border bg-card px-4 pb-4 pt-4 transition-colors duration-300 group-hover:border-foreground/30">
        <p className="line-clamp-1 min-h-[15px] font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{catName || product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[3.5rem] break-words font-display text-xl font-medium leading-snug">
          <Link href={`/products/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>
        {hasRating && (
          <div data-testid={`product-rating-${product.slug}`} className="mt-2 flex h-5 items-center gap-2 font-mono text-[11px]" aria-label={`${t("product.rating")} ${rating.toFixed(1)} / 5`}>
            <span className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`h-3 w-3 ${rating >= i + 0.75 ? "fill-lime text-lime" : rating >= i + 0.25 ? "fill-lime/50 text-lime" : "text-muted-foreground/40"}`} />
              ))}
            </span>
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
        )}
        {!hasRating && <div aria-hidden="true" className="mt-2 h-5" />}
        <div className="mt-auto grid min-h-10 grid-cols-[minmax(0,1fr)_2.5rem] items-end gap-2 pt-3">
          <PriceTag price={product.price} discountPercent={product.discountPercent} size="sm" className="min-w-0 flex-col items-start justify-end gap-0 leading-5" />
          <AddToCartButton product={product} className="shrink-0 rounded-full" />
        </div>
      </div>
    </article>
  );
}
