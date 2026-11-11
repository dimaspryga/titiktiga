"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AddToCartButton, BuyNowButton } from "@/components/add-to-cart-button";
import { ProductMedia } from "@/components/product-media";
import { QuantityStepper } from "@/components/quantity-stepper";
import { PriceTag } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useProduct, useCategories } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MAX_QUANTITY, validQuantity } from "@/lib/services/pricing";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { t, tt } = useI18n();
  const { data: product, isLoading } = useProduct(params?.slug);
  const { data: categories } = useCategories();
  const { data: allProducts } = useProducts({ category: product?.category });
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [viewerOpen, setViewerOpen] = useState(false);
  const galleryMedia = product ? [...(product.detailCover ? [product.detailCover] : []), ...product.images] : [];

  const showPreviousImage = () => {
    if (!galleryMedia.length) return;
    setImageIndex((current) => (current - 1 + galleryMedia.length) % galleryMedia.length);
  };

  const showNextImage = () => {
    if (!galleryMedia.length) return;
    setImageIndex((current) => (current + 1) % galleryMedia.length);
  };

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8" data-testid="product-not-found">
        <EmptyState
          title={t("filters.empty.title")}
          action={
            <Link href="/products" className="font-mono text-xs uppercase tracking-[0.18em] underline">
              {t("nav.shop")}
            </Link>
          }
        />
      </div>
    );
  }

  const out = product.stock <= 0;
  const catName = tt(categories?.find((c) => c.slug === product.category)?.name);
  const related = (allProducts?.items ?? []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="product-detail-page">
      <Reveal>
        <Link
          href="/products"
          className="link-underline inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
          data-testid="product-back-link"
        >
          <ArrowLeft className="h-4 w-4" /> {t("nav.shop")}
        </Link>
      </Reveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div>
          <div className="texture-grain relative aspect-square overflow-hidden bg-muted" data-testid="product-gallery-main">
            <ProductMedia
              src={galleryMedia[imageIndex] ?? product.images[0]}
              alt={`${product.name} — ${imageIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              controls
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              aria-label={`${t("product.viewFull")} ${product.name}`}
              className="absolute bottom-4 right-4 flex h-10 items-center gap-2 bg-background/80 px-3 text-xs font-medium backdrop-blur-md transition-colors hover:bg-background/95"
            >
              <Expand className="h-4 w-4" /> {t("product.viewFull")}
            </button>
            <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
              <DialogContent className="max-w-[95vw] border-0 bg-black/95 p-2 sm:max-w-5xl" aria-describedby={undefined}>
                <DialogTitle className="sr-only">{product.name}</DialogTitle>
                <div className="relative h-[85vh] w-full">
                  <ProductMedia
                    src={galleryMedia[imageIndex] ?? product.images[0]}
                    alt={product.name}
                    fill
                    sizes="95vw"
                    controls
                    className="object-contain"
                  />
                  {galleryMedia.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        aria-label="Gambar sebelumnya"
                        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/90 text-foreground backdrop-blur hover:bg-background"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={showNextImage}
                        aria-label="Gambar berikutnya"
                        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-background/90 text-foreground backdrop-blur hover:bg-background"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur">
                        {imageIndex + 1} / {galleryMedia.length}
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {product.discountPercent != null && product.discountPercent > 0 && !out && (
              <span className="absolute left-4 top-4 bg-lime px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-lime-foreground" data-testid="product-detail-discount-badge">
                -{product.discountPercent}%
              </span>
            )}
          </div>
          {galleryMedia.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3" data-testid="product-gallery-thumbs">
              {galleryMedia.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  data-testid={`product-gallery-thumb-${i}`}
                  aria-label={`${product.name} — media ${i + 1}`}
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    "relative aspect-square overflow-hidden border-2 transition-colors",
                    i === imageIndex ? "border-lime" : "border-transparent hover:border-foreground/30"
                  )}
                >
                  <ProductMedia src={img} alt={`${product.name} — media ${i + 1}`} fill autoPlay sizes="15vw" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{catName}</p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl" data-testid="product-detail-name">
            {product.name}
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <PriceTag price={product.price} discountPercent={product.discountPercent} size="lg" data-testid="product-detail-price" />
            {out && (
              <span className="bg-foreground px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-background" data-testid="product-detail-out-badge">
                {t("availability.outStock")}
              </span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{tt(product.shortDescription)}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("product.quantity")}</p>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={Math.min(product.stock, MAX_QUANTITY)}
                disabled={out}
                testIdPrefix="product-quantity"
              />
            </div>
            {!out && (
              <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground" data-testid="product-stock-note">
                {product.stock <= 10 ? `${t("availability.inStock")} — ${product.stock}` : t("availability.inStock")}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} quantity={quantity} variant="full" />
            <BuyNowButton product={product} quantity={quantity} />
          </div>

          <div className="mt-10 border-t border-border pt-8" data-testid="product-specs">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("product.specs")}</h2>
            <dl className="mt-4 space-y-3">
              {product.specs.map((spec, i) => (
                <div key={i} className="flex items-baseline justify-between gap-6 border-b border-border/60 pb-3 text-sm">
                  <dt className="text-muted-foreground">{tt(spec.label)}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-2" data-testid="product-description">
        <Reveal>
          <h2 className="font-display text-3xl font-medium">{t("product.description")}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{tt(product.description)}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="texture-grain relative aspect-square overflow-hidden bg-muted">
            <ProductMedia src={product.images[product.images.length - 1]} alt={product.name} fill controls sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" />
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <div className="mt-20 md:mt-28" data-testid="product-related">
          <h2 className="mb-10 font-display text-3xl font-medium md:text-4xl">{t("product.related")}</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
