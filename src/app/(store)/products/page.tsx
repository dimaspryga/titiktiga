"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterX, Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { SortOption } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

const PER_PAGE = 8;

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="products-page">
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog />
      </Suspense>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full" />
      ))}
    </div>
  );
}

function Catalog() {
  const { t, tt } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories } = useCategories();

  const get = useCallback((key: string) => searchParams.get(key) ?? undefined, [searchParams]);
  const query = useMemo(
    () => ({
      q: get("q"),
      category: get("category"),
      minPrice: get("min") ? Number(get("min")) : undefined,
      maxPrice: get("max") ? Number(get("max")) : undefined,
      discountOnly: get("discount") === "1",
      inStockOnly: get("stock") === "1",
      sort: (get("sort") ?? "newest") as SortOption,
      page: Number(get("page") ?? "1"),
      perPage: PER_PAGE,
    }),
    [get]
  );

  const { data, error, isLoading } = useProducts(query);
  const [qInput, setQInput] = useState(get("q") ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((get("q") ?? "") !== qInput) updateParams({ q: qInput || null, page: null });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (query.q) activeChips.push({ key: "q", label: `“${query.q}”`, clear: () => { setQInput(""); updateParams({ q: null, page: null }); } });
  if (query.category) {
    const cat = categories?.find((c) => c.slug === query.category);
    activeChips.push({ key: "category", label: tt(cat?.name) ?? query.category, clear: () => updateParams({ category: null, page: null }) });
  }
  if (query.minPrice != null) activeChips.push({ key: "min", label: `≥ ${formatIDR(query.minPrice)}`, clear: () => updateParams({ min: null, page: null }) });
  if (query.maxPrice != null) activeChips.push({ key: "max", label: `≤ ${formatIDR(query.maxPrice)}`, clear: () => updateParams({ max: null, page: null }) });
  if (query.discountOnly) activeChips.push({ key: "discount", label: t("filters.discount"), clear: () => updateParams({ discount: null, page: null }) });
  if (query.inStockOnly) activeChips.push({ key: "stock", label: t("filters.availability"), clear: () => updateParams({ stock: null, page: null }) });

  const clearAll = () => {
    setQInput("");
    router.replace("/products", { scroll: false });
  };

  const filtersPanel = (
    <div className="space-y-8" data-testid="catalog-filters">
      <div className="space-y-2">
        <Label>{t("filters.category")}</Label>
        <Select
          value={query.category ?? "all"}
          onValueChange={(v) => updateParams({ category: v === "all" ? null : v, page: null })}
        >
          <SelectTrigger className="h-10 w-full rounded-none" data-testid="catalog-filter-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">{t("admin.filter.status") === "All statuses" ? "All" : "Semua"}</SelectItem>
            {(categories ?? []).map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {tt(c.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("filters.price")}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t("filters.priceMin")}
            data-testid="catalog-filter-min-price"
            defaultValue={get("min") ?? ""}
            onBlur={(e) => updateParams({ min: e.target.value || null, page: null })}
            className="h-10 rounded-none"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder={t("filters.priceMax")}
            data-testid="catalog-filter-max-price"
            defaultValue={get("max") ?? ""}
            onBlur={(e) => updateParams({ max: e.target.value || null, page: null })}
            className="h-10 rounded-none"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="filter-discount">{t("filters.discount")}</Label>
        <Switch
          id="filter-discount"
          checked={query.discountOnly}
          data-testid="catalog-filter-discount"
          onCheckedChange={(v) => updateParams({ discount: v ? "1" : null, page: null })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="filter-stock">{t("filters.availability")}</Label>
        <Switch
          id="filter-stock"
          checked={query.inStockOnly}
          data-testid="catalog-filter-stock"
          onCheckedChange={(v) => updateParams({ stock: v ? "1" : null, page: null })}
        />
      </div>
      {activeChips.length > 0 && (
        <Button variant="outline" className="w-full rounded-none" data-testid="catalog-clear-filters" onClick={clearAll}>
          <FilterX className="mr-2 h-4 w-4" /> {t("filters.clear")}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("nav.shop")}</p>
          <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t("products.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("products.subtitle")}</p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground" data-testid="products-count">
          {t("products.count", { count: data?.total ?? 0 })}
        </p>
      </div>

      <nav
        aria-label={t("filters.category")}
        className="no-scrollbar mb-8 flex gap-2 overflow-x-auto border-y border-border py-3"
        data-testid="catalog-category-pills"
      >
        <button
          type="button"
          aria-pressed={!query.category}
          onClick={() => updateParams({ category: null, page: null })}
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
            !query.category
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          }`}
        >
          {t("admin.filter.status") === "All statuses" ? "All" : "Semua"}
        </button>
        {(categories ?? []).map((category) => {
          const active = query.category === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              aria-pressed={active}
              onClick={() => updateParams({ category: active ? null : category.slug, page: null })}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {tt(category.name)}
            </button>
          );
        })}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filtersPanel}</div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={t("products.searchPlaceholder")}
                data-testid="catalog-search-input"
                className="h-11 rounded-none pl-10"
              />
            </div>
            <Select value={query.sort} onValueChange={(v) => updateParams({ sort: v === "newest" ? null : v, page: null })}>
              <SelectTrigger className="h-11 w-[190px] rounded-none" data-testid="catalog-sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="newest">{t("sort.newest")}</SelectItem>
                <SelectItem value="price-asc">{t("sort.priceAsc")}</SelectItem>
                <SelectItem value="price-desc">{t("sort.priceDesc")}</SelectItem>
                <SelectItem value="name-asc">{t("sort.nameAsc")}</SelectItem>
                <SelectItem value="discount">{t("sort.discount")}</SelectItem>
              </SelectContent>
            </Select>
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-11 rounded-none lg:hidden" data-testid="catalog-mobile-filter-button">
                  {t("filters.open")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto rounded-none">
                <SheetTitle>{t("filters.open")}</SheetTitle>
                {filtersPanel}
              </SheetContent>
            </Sheet>
          </div>

          {activeChips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2" data-testid="catalog-active-chips">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  data-testid={`catalog-chip-${chip.key}`}
                  onClick={chip.clear}
                  className="inline-flex items-center gap-2 border border-border bg-accent px-3 py-1.5 text-xs transition-colors hover:bg-lime hover:text-lime-foreground"
                >
                  {chip.label} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          )}

          {error && (
            <EmptyState
              title={t("error.title")}
              body={t("error.body")}
              action={
                <Button variant="outline" className="rounded-none" onClick={() => router.refresh()} data-testid="catalog-retry-button">
                  {t("error.retry")}
                </Button>
              }
            />
          )}

          {isLoading && !data && <CatalogSkeleton />}

          {data && data.items.length === 0 && (
            <EmptyState
              title={t("filters.empty.title")}
              body={t("filters.empty.body")}
              action={
                <Button variant="outline" className="rounded-none" onClick={clearAll} data-testid="catalog-empty-clear">
                  {t("filters.empty.action")}
                </Button>
              }
            />
          )}

          {data && data.items.length > 0 && (
            <>
              <div className="grid items-stretch gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3" data-testid="products-grid">
                {data.items.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground" data-testid="products-showing-count">
                  {t("products.showing", { shown: data.items.length, total: data.total })}
                </p>
                {data.hasMore && (
                  <Button
                    variant="outline"
                    className="h-12 rounded-none px-10"
                    data-testid="catalog-load-more"
                    onClick={() => updateParams({ page: String(query.page + 1) })}
                  >
                    {t("products.loadMore")}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
