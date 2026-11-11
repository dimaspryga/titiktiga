"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  Lock,
  QrCode,
  WalletCards,
} from "lucide-react";
import { RequireAuth } from "@/components/auth-guard";
import { EmptyState } from "@/components/empty-state";
import { ProductMedia } from "@/components/product-media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useContent, useMidtransStatus, useProducts, useVouchers } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { midtransRepo, orderRepo } from "@/lib/repositories";
import { computeTotals, unitPrice } from "@/lib/services/pricing";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import type { Order } from "@/lib/types";
import { checkoutSchema, type CheckoutValues } from "@/lib/validation/schemas";
import { formatIDR } from "@/lib/utils";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function CheckoutPage() {
  return (
    <RequireAuth returnTo="/checkout">
      <CheckoutContent />
    </RequireAuth>
  );
}

function CheckoutContent() {
  const { t } = useI18n();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const items = useCartStore((s) => s.items);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const appliedVoucher = useCartStore((s) => s.appliedVoucher);
  const clear = useCartStore((s) => s.clear);
  const { data: content } = useContent();
  const { data: vouchers } = useVouchers();
  const { data: productPage } = useProducts({ perPage: 100 });
  const { data: midtransStatus } = useMidtransStatus();

  const [placing, setPlacing] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "midtrans">("transfer");
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Load script Midtrans Snap jika key tersedia
  useEffect(() => {
    if (!midtransStatus?.snapUrl || !midtransStatus?.clientKey) return;
    const scriptId = "midtrans-snap-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = midtransStatus.snapUrl;
    script.setAttribute("data-client-key", midtransStatus.clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [midtransStatus?.snapUrl, midtransStatus?.clientKey]);

  const voucher =
    appliedVoucher?.code.toUpperCase() === (voucherCode ?? "").toUpperCase()
      ? appliedVoucher
      : vouchers?.find((v) => v.code.toUpperCase() === (voucherCode ?? "").toUpperCase());
  const products = productPage?.items ?? [];
  const categorySlugs = [
    ...new Set(items.map((i) => products.find((p) => p.id === i.productId)?.category).filter(Boolean)),
  ] as string[];
  const totals = computeTotals(items, voucher, {
    shippingFee: content?.store.shippingFee ?? 25000,
    freeShippingThreshold: content?.store.freeShippingThreshold ?? 1000000,
    categorySlugs,
  });

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "Produk digital — tanpa pengiriman",
      notes: "",
    },
    values: session
      ? {
          name: session.name,
          email: session.email,
          phone: "",
          address: "Produk digital — tanpa pengiriman",
          notes: "",
        }
      : undefined,
  });

  useEffect(() => {
    if (items.length === 0 && !placing && !showConfigModal) {
      router.replace("/cart");
    }
  }, [items.length, placing, router, showConfigModal]);

  const onSubmit = async (values: CheckoutValues) => {
    setPlacing(true);
    const year = new Date().getFullYear();
    const number = `TT-${year}-${Date.now().toString().slice(-6)}`;

    try {
      // 1. Simpan order ke database
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
          originalUnitPrice: i.price,
          discountPercent: i.discountPercent,
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
        paymentMethod,
        paymentStatus: "waiting",
        createdAt: new Date().toISOString(),
      });

      // 2. Jalur Transfer Bank Manual
      if (paymentMethod === "transfer") {
        if (paymentProof) {
          const form = new FormData();
          form.append("proof", paymentProof);
          const proofResponse = await fetch(`/api/uploads/payment-proof/${order.id}`, { method: "POST", body: form });
          const proofResult = await proofResponse.json().catch(() => null);
          if (!proofResponse.ok) {
            throw new Error(proofResult?.error ?? "Bukti pembayaran gagal disimpan. Silakan coba kembali.");
          }
        }
        clear();
        toast.success(t("checkout.success.title"));
        router.push(`/checkout/success?number=${number}`);
        return;
      }

      // 3. Jalur Midtrans Payment Gateway
      const tokenRes = await midtransRepo.createToken({
        orderId: order.id,
        orderNumber: number,
        grossAmount: totals.total,
        customerName: values.name,
        customerEmail: values.email,
        customerPhone: values.phone,
        items: items.map((i) => ({
          id: i.productId,
          name: i.name,
          price: unitPrice(i.price, i.discountPercent),
          quantity: i.quantity,
        })),
      });

      // Jika Key Midtrans aktif, tampilkan popup Snap resmi
      if (tokenRes.isConfigured && tokenRes.token) {
        if (typeof window !== "undefined" && window.snap) {
          window.snap.pay(tokenRes.token, {
            onSuccess: () => {
              clear();
              toast.success("Pembayaran berhasil dikonfirmasi!");
              router.push(`/checkout/success?number=${number}`);
            },
            onPending: () => {
              clear();
              toast.info("Pesanan dibuat. Silakan selesaikan pembayaran sesuai instruksi.");
              router.push(`/checkout/success?number=${number}`);
            },
            onError: () => {
              toast.error("Pembayaran gagal atau dibatalkan");
              setPlacing(false);
            },
            onClose: () => {
              clear();
              toast.info("Status pesanan dapat dicek di riwayat pesanan.");
              router.push(`/checkout/success?number=${number}`);
            },
          });
          return;
        } else if (tokenRes.redirectUrl) {
          clear();
          window.location.href = tokenRes.redirectUrl;
          return;
        }
      }

      // Jika konfigurasi key belum disetup oleh admin
      setPendingOrder(order);
      setShowConfigModal(true);
      setPlacing(false);
    } catch (err: any) {
      toast.error(err?.message || "Gagal memproses pesanan");
      setPlacing(false);
    }
  };

  const handleFinish = () => {
    if (!pendingOrder) return;
    clear();
    setShowConfigModal(false);
    router.push(`/checkout/success?number=${pendingOrder.number}`);
  };

  if (items.length === 0 && !placing && !showConfigModal) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="checkout-page">
        <EmptyState
          title={t("checkout.empty.title")}
          body={t("checkout.empty.body")}
          action={
            <Button
              asChild
              className="h-12 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85"
              data-testid="checkout-empty-cta"
            >
              <Link href="/products">{t("cart.empty.cta")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isMidtransLive = Boolean(midtransStatus?.isConfigured);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16" data-testid="checkout-page">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t("checkout.title")}</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" data-testid="checkout-form" noValidate>
            {/* Informasi Kontak */}
            <div>
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("checkout.contactInfo")}
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkout-name">{t("checkout.name")}</Label>
                  <Input
                    id="checkout-name"
                    data-testid="checkout-input-name"
                    {...form.register("name")}
                    className="h-12 rounded-none"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-email">{t("form.email")}</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    data-testid="checkout-input-email"
                    {...form.register("email")}
                    className="h-12 rounded-none"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-phone">{t("checkout.phone")}</Label>
                  <Input
                    id="checkout-phone"
                    data-testid="checkout-input-phone"
                    {...form.register("phone")}
                    className="h-12 rounded-none"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="checkout-notes">{t("checkout.notes")}</Label>
                  <Input
                    id="checkout-notes"
                    data-testid="checkout-input-notes"
                    {...form.register("notes")}
                    className="h-12 rounded-none"
                  />
                </div>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("checkout.payment")}
                </h2>
                {isMidtransLive && (
                  <Badge variant="outline" className="gap-1 border-lime text-[10px] text-lime font-mono">
                    <CheckCircle2 className="h-3 w-3" /> Pembayaran Otomatis
                  </Badge>
                )}
              </div>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "transfer" | "midtrans")}
                className="space-y-4"
              >
                {/* Opsi 1: Midtrans */}
                <div
                  className={`border p-4 transition-colors ${
                    paymentMethod === "midtrans"
                      ? "border-lime bg-lime/10"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="midtrans" id="pay-midtrans" className="mt-1" />
                    <Label htmlFor="pay-midtrans" className="flex-1 cursor-pointer">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <WalletCards className="h-4 w-4 text-lime" /> Pembayaran Online (Midtrans)
                        </span>
                        <span className="rounded bg-lime/20 px-2 py-0.5 font-mono text-[10px] text-lime">
                          Instant &amp; Otomatis
                        </span>
                      </div>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Bayar instan via QRIS (GoPay, ShopeePay, BCA), Virtual Account (BCA, Mandiri, BNI, BRI), atau Kartu Kredit/Debit.
                      </span>

                      {/* Visual Channel Icons */}
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 border border-border bg-card px-2 py-1 font-mono">
                          <QrCode className="h-3 w-3 text-lime" /> QRIS / E-Wallet
                        </span>
                        <span className="inline-flex items-center gap-1 border border-border bg-card px-2 py-1 font-mono">
                          <Building2 className="h-3 w-3 text-lime" /> Virtual Account
                        </span>
                        <span className="inline-flex items-center gap-1 border border-border bg-card px-2 py-1 font-mono">
                          <CreditCard className="h-3 w-3 text-lime" /> Kartu Kredit / Debit
                        </span>
                      </div>
                    </Label>
                  </div>

                  {paymentMethod === "midtrans" && (
                    <div className="mt-4 border-t border-border/80 pt-3">
                      {isMidtransLive ? (
                        <p className="flex items-center gap-2 font-mono text-[11px] text-lime">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Popup pembayaran resmi Midtrans akan terbuka secara otomatis saat Anda mengklik tombol Buat Pesanan.
                        </p>
                      ) : (
                        <div className="rounded border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                          <p className="flex items-start gap-2 font-medium text-foreground">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime" />
                            Layanan Pembayaran Otomatis
                          </p>
                          <p className="mt-1 text-[11px]">
                            Metode pembayaran ini memproses transaksi secara real-time. Pesanan akan otomatis terverifikasi setelah pembayaran selesai.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Opsi 2: Transfer Bank Manual */}
                <div
                  className={`border p-4 transition-colors ${
                    paymentMethod === "transfer"
                      ? "border-lime bg-lime/10"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="transfer" id="pay-transfer" data-testid="checkout-payment-transfer" className="mt-1" />
                    <Label htmlFor="pay-transfer" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <CreditCard className="h-4 w-4" /> Transfer Bank
                        </span>
                      </div>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Transfer ke rekening bank toko dan unggah bukti transfer untuk verifikasi.
                      </span>
                    </Label>
                  </div>

                  {paymentMethod === "transfer" && (
                    <div className="mt-4 space-y-2 border-t border-border/80 pt-3">
                      <Label htmlFor="payment-proof" className="text-xs">
                        Bukti transfer (JPG/PNG/WebP, maks. 5 MB)
                      </Label>
                      <Input
                        id="payment-proof"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)}
                        className="h-11 rounded-none text-xs"
                      />
                    </div>
                  )}
                </div>
              </RadioGroup>

              <p
                className="mt-3 flex items-start gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                data-testid="checkout-payment-note"
              >
                <Lock className="mt-0.5 h-3 w-3 shrink-0" /> {t("checkout.paymentNote")}
              </p>
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

        {/* Ringkasan Belanja */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-border bg-card p-6" data-testid="checkout-summary">
            <h2 className="font-display text-2xl font-medium">{t("checkout.summary")}</h2>
            <ul className="mt-6 space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3" data-testid={`checkout-item-${item.slug}`}>
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-muted">
                    <ProductMedia src={item.image} alt={item.name} fill autoPlay sizes="60px" className="object-cover" />
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
                  <dt className="text-muted-foreground">
                    {t("cart.voucher")} {voucher?.code}
                  </dt>
                  <dd data-testid="checkout-voucher-discount">−{formatIDR(totals.voucherDiscount)}</dd>
                </div>
              )}
              {totals.voucherDiscount > 0 && (
                <div
                  className="flex justify-between rounded-none border border-lime/40 bg-lime/10 px-3 py-2"
                  data-testid="checkout-voucher-live-saving"
                >
                  <span className="font-medium text-lime">Harga setelah voucher</span>
                  <span className="font-semibold text-lime">Hemat {formatIDR(totals.voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-4 text-lg font-semibold">
                <dt>{t("cart.total")}</dt>
                <dd className="text-right" data-testid="checkout-total">
                  {totals.voucherDiscount > 0 && (
                    <span className="mr-2 text-sm font-normal text-muted-foreground line-through">
                      {formatIDR(totals.subtotal)}
                    </span>
                  )}
                  <span>{formatIDR(totals.total)}</span>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Dialog Konfirmasi Pesanan saat Kunci Gateway Belum Diaktifkan */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center bg-lime text-lime-foreground">
                <WalletCards className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="font-display text-xl">Pesanan Berhasil Dibuat</DialogTitle>
                <DialogDescription className="text-xs">
                  Detail pesanan Anda telah tersimpan
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="border border-border bg-card p-4 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Nomor Pesanan:</span>
                <span className="font-bold text-foreground">{pendingOrder?.number}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Total Tagihan:</span>
                <span className="font-bold text-lime">{pendingOrder ? formatIDR(pendingOrder.total) : "—"}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Metode:</span>
                <span className="text-foreground">Midtrans (QRIS, VA, E-Wallet, Kartu)</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Pesanan telah tercatat di sistem dengan nomor <strong>{pendingOrder?.number}</strong>. Anda dapat melihat detail rincian tagihan dan status pesanan melalui halaman pesanan.
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={handleFinish}
              className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85 text-xs w-full sm:w-auto"
            >
              Lihat Rincian Pesanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
