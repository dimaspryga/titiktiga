"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ShoppingBag, TicketPercent, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/auth-guard";
import { EmptyState } from "@/components/empty-state";
import { ProductMedia } from "@/components/product-media";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContent, useProducts, useVouchers } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { voucherRepo, type VoucherError } from "@/lib/repositories";
import { computeTotals, unitPrice } from "@/lib/services/pricing";
import { useCartStore } from "@/lib/stores/cart";
import { formatIDR } from "@/lib/utils";

export default function CartPage() {
  return (
    <RequireAuth returnTo="/cart">
      <CartContent />
    </RequireAuth>
  );
}

function CartContent() {
  const { t, tt } = useI18n();
  const { data: content } = useContent();
  const { data: vouchers } = useVouchers();
  const { data: productPage } = useProducts({ perPage: 100 });
  const items = useCartStore((s) => s.items);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const appliedVoucher = useCartStore((s) => s.appliedVoucher);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const setVoucher = useCartStore((s) => s.setVoucher);
  const setAppliedVoucher = useCartStore((s) => s.setAppliedVoucher);
  const [codeInput, setCodeInput] = useState("");

  const voucher =
    appliedVoucher?.code.toUpperCase() === (voucherCode ?? "").toUpperCase()
      ? appliedVoucher
      : vouchers?.find((v) => v.code.toUpperCase() === (voucherCode ?? "").toUpperCase());
  const products = productPage?.items ?? [];
  const categorySlugs = [...new Set(items.map((i) => products.find((p) => p.id === i.productId)?.category).filter(Boolean))] as string[];
  const totals = computeTotals(items, voucher, {
    shippingFee: content?.store.shippingFee ?? 25000,
    freeShippingThreshold: content?.store.freeShippingThreshold ?? 1000000,
    categorySlugs,
  });

  const applyVoucher = async () => {
    if (!codeInput.trim()) return;
    const result = await voucherRepo.check(codeInput, totals.subtotal, categorySlugs);
    if (result.ok) {
      setVoucher(result.voucher.code);
      setAppliedVoucher(result.voucher);
      toast.success(t("cart.voucherApplied", { code: result.voucher.code }));
      setCodeInput("");
    } else {
      toast.error(t(`voucher.error.${result.error as VoucherError}`));
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="cart-page">
        <EmptyState
          title={t("cart.empty.title")}
          body={t("cart.empty.body")}
          icon={<ShoppingBag className="h-6 w-6 text-muted-foreground" />}
          action={
            <Button asChild className="h-12 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85" data-testid="cart-empty-cta">
              <Link href="/products">{t("cart.empty.cta")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="cart-page">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t("cart.title")}</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground" data-testid="cart-item-count">
        {t("cart.itemCount", { count: totals.itemCount })}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border border-y border-border" data-testid="cart-items-list">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-5 py-6" data-testid={`cart-item-${item.slug}`}>
              <Link href={`/products/${item.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden bg-muted">
                <ProductMedia src={item.image} alt={item.name} fill autoPlay sizes="100px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.slug}`} className="link-underline font-display text-xl font-medium">
                      {item.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {formatIDR(unitPrice(item.price, item.discountPercent))}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t("cart.remove")}
                    data-testid={`cart-remove-${item.slug}`}
                    onClick={() => {
                      remove(item.productId);
                      toast.success(t("cart.removed"), { description: item.name });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(q) => setQuantity(item.productId, q)}
                    max={Math.min(item.stock, 99)}
                    testIdPrefix={`cart-qty-${item.slug}`}
                  />
                  <p className="font-semibold" data-testid={`cart-line-total-${item.slug}`}>
                    {formatIDR(unitPrice(item.price, item.discountPercent) * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-border bg-card p-6" data-testid="cart-summary">
            <h2 className="font-display text-2xl font-medium">{t("cart.summary")}</h2>

            <div className="mt-6">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("cart.voucher")}</p>
              {voucherCode && voucher ? (
                <div className="flex items-center justify-between border border-lime bg-lime/10 px-3 py-2.5" data-testid="cart-voucher-applied">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <TicketPercent className="h-4 w-4" /> {t("cart.voucherApplied", { code: voucher.code })}
                  </span>
                  <button
                    type="button"
                    data-testid="cart-voucher-remove"
                    onClick={() => setVoucher(null)}
                    className="font-mono text-[10px] uppercase tracking-widest underline"
                  >
                    {t("cart.voucherRemove")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder={t("cart.voucherPlaceholder")}
                    data-testid="cart-voucher-input"
                    className="h-11 rounded-none font-mono"
                  />
                  <Button type="button" variant="outline" className="h-11 rounded-none" data-testid="cart-voucher-apply" onClick={applyVoucher}>
                    {t("cart.voucherApply")}
                  </Button>
                </div>
              )}
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                <dd data-testid="cart-subtotal">{formatIDR(totals.subtotal)}</dd>
              </div>
              {totals.productDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.discount")}</dt>
                  <dd data-testid="cart-product-discount">−{formatIDR(totals.productDiscount)}</dd>
                </div>
              )}
              {totals.voucherDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.voucher")}</dt>
                  <dd data-testid="cart-voucher-discount">−{formatIDR(totals.voucherDiscount)}</dd>
                </div>
              )}
              {totals.voucherDiscount > 0 && (
                <div className="flex justify-between rounded-none border border-lime/40 bg-lime/10 px-3 py-2 text-sm" data-testid="cart-voucher-live-saving">
                  <span className="font-medium text-lime">Harga setelah voucher</span>
                  <span className="font-semibold text-lime">{formatIDR(totals.total)} <span className="ml-1 text-xs">(hemat {formatIDR(totals.voucherDiscount)})</span></span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
                <dt>{t("cart.total")}</dt>
                <dd className="text-right" data-testid="cart-total">
                  {totals.voucherDiscount > 0 && <span className="mr-2 text-sm font-normal text-muted-foreground line-through">{formatIDR(totals.subtotal)}</span>}
                  <span className="transition-colors">{formatIDR(totals.total)}</span>
                </dd>
              </div>
            </dl>

            <Button asChild className="mt-6 h-12 w-full rounded-none bg-lime text-base font-semibold text-lime-foreground hover:bg-lime/85" data-testid="cart-checkout-button">
              <Link href="/checkout">
                {t("cart.checkout")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link
              href="/products"
              className="link-underline mt-4 block text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
              data-testid="cart-continue-link"
            >
              {t("cart.continue")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
