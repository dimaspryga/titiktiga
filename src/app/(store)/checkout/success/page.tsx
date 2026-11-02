"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orderRepo } from "@/lib/repositories";
import { useI18n } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";
import useSWR from "swr";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto my-24 h-96 max-w-2xl" />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const number = searchParams.get("number");
  const { data: order, isLoading } = useSWR(number ? ["order", number] : null, () => orderRepo.getByNumber(number!));

  if (isLoading) return <Skeleton className="mx-auto my-24 h-96 max-w-2xl" />;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center" data-testid="checkout-success-page">
        <p className="font-display text-3xl">{t("notfound.title")}</p>
        <Button asChild className="mt-8 h-12 rounded-none bg-foreground px-8 text-background hover:bg-foreground/85">
          <Link href="/" data-testid="checkout-success-home-link">{t("notfound.cta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:py-24" data-testid="checkout-success-page">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime" data-testid="checkout-success-icon">
          <CheckCircle2 className="h-8 w-8 text-lime-foreground" />
        </span>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">{t("checkout.success.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("checkout.success.body")}</p>
        <p className="mt-8 inline-block border border-border bg-card px-6 py-3 font-mono text-sm" data-testid="checkout-success-number">
          {t("checkout.success.number")}: <span className="font-bold">{order.number}</span>
        </p>
      </div>

      <div className="mt-12 border border-border bg-card p-6" data-testid="checkout-success-summary">
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3" data-testid={`checkout-success-item-${item.slug}`}>
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-muted">
                <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />
                <span className="absolute right-0 top-0 bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">
                  ×{item.quantity}
                </span>
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</p>
              <p className="text-sm font-semibold">{formatIDR(item.subtotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
            <dd>{formatIDR(order.subtotal)}</dd>
          </div>
          {(order.productDiscount > 0 || order.voucherDiscount > 0) && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("cart.discount")}</dt>
              <dd>−{formatIDR(order.productDiscount + order.voucherDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
            <dt>{t("cart.total")}</dt>
            <dd data-testid="checkout-success-total">{formatIDR(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="h-12 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85" data-testid="checkout-success-continue">
          <Link href="/products">{t("checkout.success.cta")}</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-none px-8" data-testid="checkout-success-orders-link">
          <Link href="/orders" className="items-center gap-2">
            <PackageCheck className="h-4 w-4" /> {t("checkout.success.orders")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
