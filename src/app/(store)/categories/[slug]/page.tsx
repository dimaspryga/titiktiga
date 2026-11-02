"use client";

import { useParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const { t, tt } = useI18n();
  const { data: categories } = useCategories();
  const category = categories?.find((c) => c.slug === params?.slug);
  const { data, isLoading } = useProducts({ category: params?.slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="category-page">
      <Reveal>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("nav.categories")}
        </p>
        <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">
          {category ? tt(category.name) : params?.slug}
        </h1>
        {category && <p className="mt-3 max-w-md text-muted-foreground">{tt(category.description)}</p>}
      </Reveal>

      {isLoading && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && <EmptyState title={t("filters.empty.title")} className="mt-12" />}

      {data && data.items.length > 0 && (
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4" data-testid="category-products-grid">
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
