"use client";

import { TicketPercent } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Voucher } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

export function voucherShort(v: Voucher): string {
  return v.type === "percentage" ? `${v.value}%` : formatIDR(v.value);
}

export function voucherDescription(v: Voucher): string {
  const min = v.minPurchase > 0 ? ` · min. ${formatIDR(v.minPurchase)}` : "";
  return v.type === "percentage" ? `Potongan ${v.value}%${min}` : `Potongan ${formatIDR(v.value)}${min}`;
}

/**
 * Voucher aktif di ringkasan keranjang — ditampilkan seperti tiket fisik:
 * lubang sobekan di kedua sisi, garis putus-putus, dan kode besar.
 */
export function VoucherTicket({
  voucher,
  onRemove,
}: {
  voucher: Voucher;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="relative flex items-stretch border border-lime bg-lime/10" data-testid="cart-voucher-ticket">
      <span aria-hidden="true" className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
      <span aria-hidden="true" className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
      <div className="min-w-0 flex-1 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{t("cart.voucherActive")}</p>
        <p className="mt-1 truncate font-mono text-2xl font-bold tracking-[0.14em]" data-testid="cart-voucher-code">
          {voucher.code}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{voucherDescription(voucher)}</p>
      </div>
      <div aria-hidden="true" className="w-0 border-l-2 border-dashed border-lime/70" />
      <div className="flex w-20 flex-col items-center justify-center gap-2 p-3">
        <TicketPercent className="h-5 w-5 text-foreground" />
        <span className="flex items-end gap-[2px]" aria-hidden="true">
          {[6, 3, 8, 4, 9, 3, 6].map((h, i) => (
            <span key={i} className="w-[2px] bg-foreground/70" style={{ height: h + 6 }} />
          ))}
        </span>
        <button
          type="button"
          data-testid="cart-voucher-remove"
          onClick={onRemove}
          className="font-mono text-[10px] uppercase tracking-widest underline"
        >
          {t("cart.voucherRemove")}
        </button>
      </div>
    </div>
  );
}

/** Mini tiket voucher yang tersedia — klik untuk langsung dipakai. */
export function VoucherMiniTicket({ voucher, onApply }: { voucher: Voucher; onApply: () => void }) {
  return (
    <button
      type="button"
      data-testid={`cart-voucher-chip-${voucher.code}`}
      onClick={onApply}
      className="group relative flex w-full items-center gap-3 border border-dashed border-border bg-background px-3 py-2 text-left transition-colors hover:border-lime hover:bg-lime/10"
    >
      <TicketPercent className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
      <span className="font-mono text-sm font-bold tracking-widest">{voucher.code}</span>
      <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{voucherShort(voucher)}</span>
    </button>
  );
}

/** Daftar voucher aktif yang bisa langsung dipakai dari keranjang. */
export function AvailableVouchers({
  vouchers,
  onApply,
  subtotal,
  categorySlugs,
}: {
  vouchers: Voucher[];
  onApply: (code: string) => void;
  subtotal: number;
  categorySlugs: string[];
}) {
  const { t } = useI18n();
  const today = new Date().toISOString().slice(0, 10);
  const active = vouchers.filter((v) => v.active && (!v.expiryDate || v.expiryDate >= today));
  const eligible = (v: Voucher) =>
    subtotal >= v.minPurchase && (!v.eligibleCategories || v.eligibleCategories.some((c) => categorySlugs.includes(c)));
  const list = active.slice(0, 3);
  if (list.length === 0) return null;

  return (
    <div className="mt-3 space-y-2" data-testid="cart-vouchers-available">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("cart.voucherAvailable")}</p>
      {list.map((v) =>
        eligible(v) ? (
          <VoucherMiniTicket key={v.id} voucher={v} onApply={() => onApply(v.code)} />
        ) : (
          <span
            key={v.id}
            aria-disabled="true"
            data-testid={`cart-voucher-chip-disabled-${v.code}`}
            className="flex w-full cursor-not-allowed items-center gap-3 border border-dashed border-border/50 bg-muted/40 px-3 py-2 opacity-60"
          >
            <TicketPercent className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-mono text-sm font-bold tracking-widest">{v.code}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{voucherDescription(v)}</span>
          </span>
        )
      )}
    </div>
  );
}
