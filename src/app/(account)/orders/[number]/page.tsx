"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductMedia } from "@/components/product-media";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderByNumber } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams<{ number: string }>();
  const { t } = useI18n();
  const orderNumber = typeof params?.number === "string" ? params.number : "";
  const { data: order, isLoading, error } = useOrderByNumber(orderNumber);

  if (isLoading) {
    return (
      <div className="space-y-5" data-testid="order-detail-loading">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order || error) {
    return (
      <div data-testid="order-detail-not-found">
        <EmptyState
          title={t("orders.detailNotFound")}
          icon={<Package className="h-6 w-6 text-muted-foreground" />}
          action={
            <Button asChild variant="outline" className="rounded-none">
              <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />{t("orders.backToOrders")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="order-detail-page">
      <Link href="/orders" className="link-underline inline-flex items-center gap-2 text-sm text-muted-foreground" data-testid="order-detail-back">
        <ArrowLeft className="h-4 w-4" /> {t("orders.backToOrders")}
      </Link>

      <section className="border border-border bg-card p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("orders.detailTitle")}</p>
            <h2 className="mt-1 font-display text-2xl font-medium" data-testid="order-detail-number">{order.number}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} label={t(`status.${order.status}`)} />
        </div>
      </section>

      <section className="border border-border bg-card p-5 md:p-7">
        <h3 className="font-display text-xl font-medium">{t("orders.itemsHeading")}</h3>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {order.items.map((item, index) => {
            const originalPrice = item.originalUnitPrice ?? item.unitPrice;
            const hasDiscount = originalPrice > item.unitPrice;
            return (
              <li key={`${item.productId}-${index}`} className="flex gap-4 py-4" data-testid={`order-detail-item-${index}`}>
                <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-border bg-muted sm:h-28 sm:w-28">
                  {item.image ? (
                    <ProductMedia src={item.image} alt={item.name} fill autoPlay sizes="112px" className="object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t("orders.noImage")}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{t("orders.quantity")}: {item.quantity}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    {hasDiscount && <span className="line-through">{formatIDR(originalPrice)}</span>}
                    <span>{formatIDR(item.unitPrice)} {t("orders.perItem")}</span>
                    {hasDiscount && item.discountPercent != null && item.discountPercent > 0 && (
                      <span className="bg-lime/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">-{item.discountPercent}%</span>
                    )}
                  </div>
                </div>
                <p className="shrink-0 text-right text-sm font-semibold">{formatIDR(item.subtotal)}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 space-y-2 text-sm">
          <SummaryRow label={t("orders.subtotalBeforeDiscount")} value={formatIDR(order.subtotal + order.productDiscount)} />
          {order.productDiscount > 0 && <SummaryRow label={t("cart.discount")} value={`−${formatIDR(order.productDiscount)}`} />}
          <SummaryRow label={t("orders.subtotalAfterDiscount")} value={formatIDR(order.subtotal)} />
          {order.voucherDiscount > 0 && (
            <SummaryRow label={`${t("cart.voucher")}${order.voucherCode ? ` (${order.voucherCode})` : ""}`} value={`−${formatIDR(order.voucherDiscount)}`} />
          )}
          {order.shippingFee > 0 && <SummaryRow label={t("cart.shipping")} value={formatIDR(order.shippingFee)} />}
          <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold">
            <span>{t("cart.total")}</span>
            <span data-testid="order-detail-total">{formatIDR(order.total)}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-border bg-card p-5 md:p-6">
          <h3 className="font-display text-xl font-medium">{t("orders.customerHeading")}</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <DetailRow label={t("auth.name")} value={order.customerName} />
            <DetailRow label={t("auth.email")} value={order.customerEmail} />
            <DetailRow label={t("checkout.phone")} value={order.customerPhone || "—"} />
            <DetailRow label={t("checkout.address")} value={order.address} />
            {order.notes && <DetailRow label={t("checkout.notes")} value={order.notes} />}
          </dl>
        </section>

        <section className="border border-border bg-card p-5 md:p-6">
          <h3 className="font-display text-xl font-medium">{t("orders.paymentHeading")}</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <DetailRow label={t("orders.paymentMethod")} value={order.paymentMethod === "midtrans" ? "Midtrans" : "Transfer Bank"} />
            <DetailRow label={t("orders.paymentStatus")} value={paymentStatusLabel(order.paymentStatus, t)} />
            {order.paymentNote && <DetailRow label={t("orders.paymentNote")} value={order.paymentNote} />}
          </dl>
          {order.paymentProof && (
            <a href={order.paymentProof} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-3 border border-border p-2 text-sm hover:border-lime">
              <div className="relative h-16 w-16 overflow-hidden bg-muted">
                <ProductMedia src={order.paymentProof} alt={t("orders.paymentProof")} fill className="object-contain" />
              </div>
              <span>{t("orders.paymentProof")}</span>
            </a>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(90px,0.7fr)_minmax(0,1.3fr)] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}

function paymentStatusLabel(status: string | undefined, t: (key: string) => string) {
  if (status === "submitted") return t("orders.paymentSubmitted");
  if (status === "approved") return t("orders.paymentApproved");
  if (status === "rejected") return t("orders.paymentRejected");
  return t("orders.paymentWaiting");
}

function OrderStatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-muted text-foreground",
    processing: "border border-foreground text-foreground",
    shipped: "bg-foreground text-background",
    completed: "bg-lime text-lime-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };
  return <span className={`px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${styles[status]}`}>{label}</span>;
}
