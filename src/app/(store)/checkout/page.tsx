"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { RequireAuth } from "@/components/auth-guard";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useContent, useProducts, useVouchers } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { orderRepo } from "@/lib/repositories";
import { computeTotals, unitPrice } from "@/lib/services/pricing";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { checkoutSchema, type CheckoutValues } from "@/lib/validation/schemas";
import { formatIDR } from "@/lib/utils";

export default function CheckoutPage() {
  return (
    <RequireAuth returnTo="/checkout">
      <CheckoutContent />
    </RequireAuth>
  );
}

function CheckoutContent() {
  const { t, tt } = useI18n();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const items = useCartStore((s) => s.items);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const clear = useCartStore((s) => s.clear);
  const { data: content } = useContent();
  const { data: vouchers } = useVouchers();
  const { data: productPage } = useProducts({ perPage: 100 });
  const [placing, setPlacing] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const voucher = vouchers?.find((v) => v.code.toUpperCase() === (voucherCode ?? "").toUpperCase());
  const products = productPage?.items ?? [];
  const categorySlugs = [...new Set(items.map((i) => products.find((p) => p.id === i.productId)?.category).filter(Boolean))] as string[];
  const totals = computeTotals(items, voucher, {
    shippingFee: content?.store.shippingFee ?? 25000,
    freeShippingThreshold: content?.store.freeShippingThreshold ?? 1000000,
  });

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", email: "", phone: "", address: "Produk digital — tanpa pengiriman", notes: "" },
    values: session ? { name: session.name, email: session.email, phone: "", address: "Produk digital — tanpa pengiriman", notes: "" } : undefined,
  });

  useEffect(() => {
    if (items.length === 0 && !placing) {
      router.replace("/cart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const onSubmit = async (values: CheckoutValues) => {
    setPlacing(true);
    const year = new Date().getFullYear();
    const number = `TT-${year}-${Date.now().toString().slice(-6)}`;
    const order = await orderRepo.create({
      number,
      customerName: values.name,
      customerEmail: values.email,
      customerPhone: values.phone,
      address: "Produk digital — tanpa pengiriman",
      notes: values.notes ?? "",
      items: items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        image: i.image,
        quantity: i.quantity,
        unitPrice: unitPrice(i.price, i.discountPercent),
        subtotal: unitPrice(i.price, i.discountPercent) * i.quantity,
      })),
      subtotal: totals.subtotal,
      productDiscount: totals.productDiscount,
      voucherCode: voucher ? voucher.code : null,
      voucherDiscount: totals.voucherDiscount,
      shippingFee: totals.shippingFee,
      total: totals.total,
      status: "pending",
      paymentStatus: paymentProof ? "submitted" : "waiting",
      createdAt: new Date().toISOString(),
    });
    if (paymentProof) {
      const form = new FormData();
      form.append("proof", paymentProof);
      await fetch(`/api/uploads/payment-proof/${order.id}`, { method: "POST", body: form });
    }
    clear();
    toast.success(t("checkout.success.title"));
    router.push(`/checkout/success?number=${number}`);
  };

  if (items.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="checkout-page">
        <EmptyState
          title={t("checkout.empty.title")}
          body={t("checkout.empty.body")}
          action={
            <Button asChild className="h-12 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85" data-testid="checkout-empty-cta">
              <Link href="/products">{t("cart.empty.cta")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="checkout-page">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t("checkout.title")}</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="checkout-form" noValidate>
            <div>
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("checkout.contactInfo")}
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkout-name">{t("checkout.name")}</Label>
                  <Input id="checkout-name" data-testid="checkout-input-name" {...form.register("name")} className="h-12 rounded-none" />
                  {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-email">{t("form.email")}</Label>
                  <Input id="checkout-email" type="email" data-testid="checkout-input-email" {...form.register("email")} className="h-12 rounded-none" />
                  {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-phone">{t("checkout.phone")}</Label>
                  <Input id="checkout-phone" data-testid="checkout-input-phone" {...form.register("phone")} className="h-12 rounded-none" />
                  {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="checkout-notes">{t("checkout.notes")}</Label>
                  <Input id="checkout-notes" data-testid="checkout-input-notes" {...form.register("notes")} className="h-12 rounded-none" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("checkout.payment")}
              </h2>
              <RadioGroup defaultValue="transfer" className="space-y-3">
                <div className="flex items-center gap-3 border border-lime bg-lime/10 px-4 py-3">
                  <RadioGroupItem value="transfer" id="pay-transfer" data-testid="checkout-payment-transfer" />
                  <Label htmlFor="pay-transfer" className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4" /> Transfer Bank (Demo)
                  </Label>
                </div>
              </RadioGroup>
              <p className="mt-3 flex items-start gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground" data-testid="checkout-payment-note">
                <Lock className="mt-0.5 h-3 w-3 shrink-0" /> {t("checkout.paymentNote")}
              </p>
              <div className="mt-4 space-y-2">
                <Label htmlFor="payment-proof">Screenshot bukti transfer (JPG/PNG/WebP, maks. 5 MB)</Label>
                <Input id="payment-proof" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)} className="h-12 rounded-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || placing}
              data-testid="checkout-place-order"
              className="h-14 w-full rounded-none bg-lime text-base font-semibold text-lime-foreground hover:bg-lime/85 md:w-auto md:px-12"
            >
              {placing || form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {placing ? t("checkout.placing") : t("checkout.place")}
            </Button>
          </form>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-border bg-card p-6" data-testid="checkout-summary">
            <h2 className="font-display text-2xl font-medium">{t("checkout.summary")}</h2>
            <ul className="mt-6 space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3" data-testid={`checkout-item-${item.slug}`}>
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-muted">
                    <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />
                    <span className="absolute right-0 top-0 bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">
                      ×{item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatIDR(unitPrice(item.price, item.discountPercent))} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatIDR(unitPrice(item.price, item.discountPercent) * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                <dd data-testid="checkout-subtotal">{formatIDR(totals.subtotal)}</dd>
              </div>
              {totals.productDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.discount")}</dt>
                  <dd>−{formatIDR(totals.productDiscount)}</dd>
                </div>
              )}
              {totals.voucherDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.voucher")} {voucher?.code}</dt>
                  <dd data-testid="checkout-voucher-discount">−{formatIDR(totals.voucherDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
                <dt>{t("cart.total")}</dt>
                <dd data-testid="checkout-total">{formatIDR(totals.total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
