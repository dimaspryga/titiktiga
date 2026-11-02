"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/stores/session";
import type { OrderStatus } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

export default function OrdersPage() {
  const { t } = useI18n();
  const session = useSessionStore((s) => s.session);
  const { data, isLoading } = useOrders({ email: session?.email ?? "", perPage: 50 });

  return (
    <div data-testid="orders-page">
      <h2 className="font-display text-3xl font-medium">{t("account.orders")}</h2>

      {isLoading && <Skeleton className="mt-8 h-64 w-full" />}

      {!isLoading && (data?.total ?? 0) === 0 && (
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
      )}

      {data && data.total > 0 && (
        <ul className="mt-8 space-y-4" data-testid="orders-list">
          {data.items.map((order) => (
            <li key={order.id} className="border border-border bg-card p-5" data-testid={`order-card-${order.number}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold" data-testid={`order-number-${order.number}`}>{order.number}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
              </div>
              <ul className="mt-4 space-y-1 border-t border-border/60 pt-3">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-4 text-sm" data-testid={`order-item-${order.number}-${item.slug}`}>
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatIDR(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                <span>{t("account.total")}</span>
                <span data-testid={`order-total-${order.number}`}>{formatIDR(order.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
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
