"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Expand } from "lucide-react";
import { useState } from "react";
import { PriceTag } from "@/components/price";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AddToCartButton } from "@/components/add-to-cart-button";
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const catName = tt(categories?.find((c) => c.slug === product.category)?.name);
  const out = product.stock <= 0;

  return (
    <article className={cn("group relative flex flex-col", className)} data-testid={`product-card-${product.slug}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} data-testid={`product-card-link-${product.slug}`} aria-label={product.name} className="relative block h-full w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
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
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={`Lihat ${product.name} seutuhnya`}
            onClick={() => setViewerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur hover:bg-background"
          >
            <Expand className="h-4 w-4" />
          </button>
          <Link
            href={`/products/${product.slug}`}
            aria-label={product.name}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur hover:bg-background"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
          <DialogContent className="max-w-[95vw] border-0 bg-black/95 p-2 sm:max-w-5xl" aria-describedby={undefined}>
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
            <div className="relative h-[85vh] w-full">
              <Image src={product.images[0]} alt={product.name} fill sizes="95vw" className="object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{catName || product.category}</p>
        <h3 className="mt-1 font-display text-xl font-medium leading-snug">
          <Link href={`/products/${product.slug}`} className="link-underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceTag price={product.price} discountPercent={product.discountPercent} />
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
