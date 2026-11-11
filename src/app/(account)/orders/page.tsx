"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/stores/session";
import type { OrderStatus } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

const PER_PAGE = 10;
const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "completed", "cancelled"];

export default function OrdersPage() {
  const { t } = useI18n();
  const session = useSessionStore((s) => s.session);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isPlaceholderData, error } = useOrders({
    email: session?.email ?? "",
    q: searchQuery || undefined,
    status,
    page,
    perPage: PER_PAGE,
  });
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PER_PAGE));

  const resetFilters = () => {
    setSearch("");
    setSearchQuery("");
    setStatus("all");
    setPage(1);
  };

  return (
    <div data-testid="orders-page">
      <h2 className="font-display text-3xl font-medium">{t("account.orders")}</h2>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t("orders.search")}
            aria-label={t("orders.search")}
            data-testid="orders-search"
            className="h-11 rounded-none pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as OrderStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-full rounded-none sm:w-56" data-testid="orders-status-filter" aria-label={t("orders.filterStatus")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">{t("orders.allStatuses")}</SelectItem>
            {STATUSES.map((value) => (
              <SelectItem key={value} value={value}>{t(`status.${value}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {t("orders.loadError")}
        </p>
      )}

      {isLoading && <Skeleton className="mt-8 h-64 w-full" />}

      {!isLoading && !error && (data?.total ?? 0) === 0 && (
        searchQuery || status !== "all" ? (
          <div className="mt-8 border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">{t("orders.noMatches")}</p>
            <Button type="button" variant="outline" onClick={resetFilters} className="mt-4 rounded-none" data-testid="orders-reset-filters">
              {t("orders.resetFilters")}
            </Button>
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            title={t("account.orders.empty.title")}
            body={t("account.orders.empty.body")}
            icon={<Package className="h-6 w-6 text-muted-foreground" />}
            action={
              <Link href="/products" className="font-mono text-xs uppercase tracking-[0.18em] underline" data-testid="orders-empty-cta">
                {t("account.orders.cta")}
              </Link>
            }
          />
        )
      )}

      {data && data.total > 0 && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground" aria-live="polite">
            <span>{t("orders.results", { count: data.total })}</span>
            <span>{t("orders.page", { page, total: totalPages })}</span>
          </div>
          <ul className={`mt-3 space-y-4 transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`} data-testid="orders-list">
            {data.items.map((order) => (
              <li key={order.id} className="border border-border bg-card p-5 md:p-6" data-testid={`order-card-${order.number}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold" data-testid={`order-number-${order.number}`}>{order.number}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
                </div>

                <ul className="mt-4 divide-y divide-border/60 border-y border-border/60">
                  {order.items.map((item, index) => {
                    const originalPrice = item.originalUnitPrice ?? item.unitPrice;
                    const hasItemDiscount = originalPrice > item.unitPrice;
                    return (
                      <li
                        key={`${item.productId}-${index}`}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                        data-testid={`order-item-${order.number}-${item.slug}`}
                      >
                        <div className="min-w-0">
                          <p className="font-medium">{item.name} <span className="text-muted-foreground">× {item.quantity}</span></p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            {hasItemDiscount && (
                              <span className="line-through">{formatIDR(originalPrice)}</span>
                            )}
                            <span>{formatIDR(item.unitPrice)} {t("orders.perItem")}</span>
                            {hasItemDiscount && item.discountPercent != null && item.discountPercent > 0 && (
                              <span className="bg-lime/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                                -{item.discountPercent}%
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="font-semibold">{formatIDR(item.subtotal)}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <SummaryRow label={t("orders.subtotalBeforeDiscount")} value={formatIDR(order.subtotal + order.productDiscount)} />
                  {order.productDiscount > 0 && (
                    <SummaryRow label={t("cart.discount")} value={`−${formatIDR(order.productDiscount)}`} />
                  )}
                  <SummaryRow label={t("orders.subtotalAfterDiscount")} value={formatIDR(order.subtotal)} />
                  {order.voucherDiscount > 0 && (
                    <SummaryRow
                      label={`${t("cart.voucher")}${order.voucherCode ? ` (${order.voucherCode})` : ""}`}
                      value={`−${formatIDR(order.voucherDiscount)}`}
                    />
                  )}
                  {order.shippingFee > 0 && (
                    <SummaryRow label={t("cart.shipping")} value={formatIDR(order.shippingFee)} />
                  )}
                  <div className="flex justify-between gap-4 border-t border-border pt-3 font-semibold">
                    <span>{t("account.total")}</span>
                    <span data-testid={`order-total-${order.number}`}>{formatIDR(order.total)}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button asChild type="button" variant="outline" className="rounded-none" data-testid={`order-detail-link-${order.number}`}>
                    <Link href={`/orders/${encodeURIComponent(order.number)}`}>{t("orders.viewDetails")}</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              data-testid="orders-previous-page"
            >
              {t("orders.previous")}
            </Button>
            <span className="font-mono text-xs text-muted-foreground">{t("orders.page", { page, total: totalPages })}</span>
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              disabled={!data.hasMore || isFetching}
              onClick={() => setPage((current) => current + 1)}
              data-testid="orders-next-page"
            >
              {t("orders.next")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-muted text-foreground",
    processing: "border border-foreground text-foreground",
    shipped: "bg-foreground text-background",
    completed: "bg-lime text-lime-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };
  return (
    <span data-testid={`order-status-${status}`} className={`px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${styles[status]}`}>
      {label}
    </span>
  );
}
