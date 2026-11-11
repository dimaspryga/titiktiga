"use client";

import { useState } from "react";
import { Eye, CheckCircle2, XCircle, Image as ImageIcon, ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { Order, OrderStatus } from "@/lib/types";
import { formatIDR, cn } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [viewingProof, setViewingProof] = useState<Order | null>(null);

  const { data, orders, isLoading, updateOrderStatus, reviewPayment: reviewPaymentMutation } = useOrders({
    q: search || undefined,
    status,
    page,
    perPage: 6,
  });

  const changeStatus = async (id: string, next: OrderStatus) => {
    await updateOrderStatus(id, next);
  };

  const reviewPayment = async (id: string, paymentStatus: "approved" | "rejected") => {
    await reviewPaymentMutation(id, paymentStatus);
  };

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 6));

  return (
    <div className="space-y-8" data-testid="admin-orders-page">
      <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.orders")}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nomor / nama / email..."
          data-testid="admin-orders-search"
          className="h-11 max-w-xs rounded-none"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as OrderStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-48 rounded-none" data-testid="admin-orders-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">{t("admin.filter.status")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="ml-auto font-mono text-xs text-muted-foreground" data-testid="admin-orders-count">
          {data?.total ?? 0} — hal. {page}/{totalPages}
        </p>
      </div>

      <div className="overflow-x-auto border border-border bg-card" data-testid="admin-orders-table">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">{t("admin.table.customer")}</th>
              <th className="px-4 py-3">{t("admin.table.date")}</th>
              <th className="px-4 py-3">Pembayaran</th>
              <th className="px-4 py-3">{t("admin.table.total")}</th>
              <th className="px-4 py-3">{t("admin.table.status")}</th>
              <th className="px-4 py-3 text-right">{t("admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {t("loading")}
                </td>
              </tr>
            )}
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-border/60" data-testid={`admin-order-row-${order.number}`}>
                <td className="px-4 py-3 font-mono font-semibold">{order.number}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {order.paymentMethod === "midtrans" ? "Midtrans" : "Transfer Bank"}
                    </span>
                    {order.paymentProof ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingProof(order)}
                          className="inline-flex items-center gap-1 rounded border border-border bg-accent/60 px-2 py-0.5 text-xs font-medium text-foreground transition-colors hover:border-lime hover:bg-lime/10"
                          title="Klik untuk melihat bukti transfer"
                          data-testid={`admin-order-proof-btn-${order.number}`}
                        >
                          <ImageIcon className="h-3 w-3 text-lime" />
                          <span>Lihat Bukti</span>
                        </button>
                        {order.paymentStatus === "submitted" && (
                          <span
                            className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"
                            title="Menunggu Review Admin"
                          />
                        )}
                      </div>
                    ) : order.paymentMethod === "transfer" ? (
                      <span className="text-[11px] italic text-muted-foreground/70">Belum ada bukti</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Otomatis Snap</span>
                    )}
                    {order.paymentStatus && (
                      <span
                        className={cn(
                          "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5",
                          order.paymentStatus === "approved"
                            ? "bg-lime/20 text-lime-foreground dark:text-lime"
                            : order.paymentStatus === "submitted"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                            : order.paymentStatus === "rejected"
                            ? "bg-destructive/15 text-destructive font-semibold"
                            : "text-muted-foreground bg-muted/40"
                        )}
                      >
                        {order.paymentStatus === "submitted"
                          ? "Perlu Verifikasi"
                          : order.paymentStatus === "approved"
                          ? "Lunas"
                          : order.paymentStatus === "rejected"
                          ? "Ditolak"
                          : "Menunggu"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{formatIDR(order.total)}</td>
                <td className="px-4 py-3">
                  <Select value={order.status} onValueChange={(v) => changeStatus(order.id, v as OrderStatus)}>
                    <SelectTrigger className="h-8 w-36 rounded-none text-xs" data-testid={`admin-order-status-${order.number}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-none" data-testid={`admin-order-detail-${order.number}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle data-testid="admin-order-detail-title">{order.number}</DialogTitle>
                      </DialogHeader>
                      <OrderDetail
                        order={order}
                        onReview={(status) => reviewPayment(order.id, status)}
                        onViewProof={() => setViewingProof(order)}
                      />
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between" data-testid="admin-orders-pagination">
        <Button
          variant="outline"
          size="sm"
          className="rounded-none"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          data-testid="admin-orders-prev"
        >
          ← Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          data-testid="admin-orders-next"
        >
          Selanjutnya →
        </Button>
      </div>

      {/* MODAL PRATINJAU BUKTI TRANSFER KHUSUS */}
      <Dialog open={Boolean(viewingProof)} onOpenChange={(open) => !open && setViewingProof(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Bukti Transfer — {viewingProof?.number}</span>
            </DialogTitle>
          </DialogHeader>
          {viewingProof && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
                <div>
                  <p className="font-semibold">{viewingProof.customerName}</p>
                  <p className="text-muted-foreground">{viewingProof.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">{formatIDR(viewingProof.total)}</p>
                  <span
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5",
                      viewingProof.paymentStatus === "approved"
                        ? "bg-lime/20 text-lime-foreground dark:text-lime"
                        : viewingProof.paymentStatus === "submitted"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                        : viewingProof.paymentStatus === "rejected"
                        ? "bg-destructive/15 text-destructive font-semibold"
                        : "text-muted-foreground bg-muted/40"
                    )}
                  >
                    {viewingProof.paymentStatus === "submitted"
                      ? "Menunggu Verifikasi"
                      : viewingProof.paymentStatus === "approved"
                      ? "Disetujui"
                      : viewingProof.paymentStatus === "rejected"
                      ? "Ditolak"
                      : "Menunggu"}
                  </span>
                </div>
              </div>

              {viewingProof.paymentProof ? (
                <div className="relative flex items-center justify-center overflow-hidden rounded border border-border bg-black/5 p-2 dark:bg-white/5">
                  <img
                    src={viewingProof.paymentProof}
                    alt={`Bukti transfer pesanan ${viewingProof.number}`}
                    className="max-h-[55vh] max-w-full rounded object-contain shadow-sm"
                  />
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Tidak ada file bukti transfer yang ditemukan.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {viewingProof.paymentProof && (
                  <Button asChild variant="outline" size="sm" className="rounded-none">
                    <a href={viewingProof.paymentProof} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-3.5 w-3.5" /> Buka Ukuran Penuh
                    </a>
                  </Button>
                )}
                {viewingProof.paymentStatus === "submitted" && (
                  <div className="ml-auto flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85"
                      onClick={async () => {
                        await reviewPayment(viewingProof.id, "approved");
                        setViewingProof(null);
                      }}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Setujui Pembayaran
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-none"
                      onClick={async () => {
                        await reviewPayment(viewingProof.id, "rejected");
                        setViewingProof(null);
                      }}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Tolak
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderDetail({
  order,
  onReview,
  onViewProof,
}: {
  order: Order;
  onReview: (status: "approved" | "rejected") => void;
  onViewProof: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 text-sm" data-testid="admin-order-detail">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("admin.table.customer")}</p>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {order.customerEmail} — {order.customerPhone}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Alamat</p>
          <p className="text-xs leading-relaxed">{order.address}</p>
        </div>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {order.items.map((item, index) => {
          const originalPrice = item.originalUnitPrice ?? item.unitPrice;
          const hasItemDiscount = originalPrice > item.unitPrice;
          return (
            <li key={`${item.productId}-${index}`} className="flex flex-wrap justify-between gap-4 py-3" data-testid={`admin-order-item-${item.slug}`}>
              <span>
                <span className="block">{item.name} × {item.quantity}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {hasItemDiscount && <span className="line-through">{formatIDR(originalPrice)}</span>}
                  <span>{formatIDR(item.unitPrice)} / item</span>
                  {hasItemDiscount && item.discountPercent != null && item.discountPercent > 0 && (
                    <span className="bg-lime/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">-{item.discountPercent}%</span>
                  )}
                </span>
              </span>
              <span className="font-medium">{formatIDR(item.subtotal)}</span>
            </li>
          );
        })}
      </ul>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("orders.subtotalBeforeDiscount")}</span>
          <span>{formatIDR(order.subtotal + order.productDiscount)}</span>
        </div>
        {order.productDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("cart.discount")}</span>
            <span>−{formatIDR(order.productDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("orders.subtotalAfterDiscount")}</span>
          <span>{formatIDR(order.subtotal)}</span>
        </div>
        {order.voucherDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("cart.voucher")} {order.voucherCode}
            </span>
            <span>−{formatIDR(order.voucherDiscount)}</span>
          </div>
        )}
        {order.shippingFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("cart.shipping")}</span>
            <span>{formatIDR(order.shippingFee)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 text-base font-semibold">
          <span>{t("cart.total")}</span>
          <span>{formatIDR(order.total)}</span>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Metode Pembayaran</p>
            <p className="mt-0.5 text-xs font-medium">
              {order.paymentMethod === "midtrans" ? "Midtrans Gateway (Otomatis)" : "Transfer Bank Manual (BCA)"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status Pembayaran</p>
            <span
              className={cn(
                "mt-0.5 inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 font-semibold",
                order.paymentStatus === "approved"
                  ? "bg-lime text-lime-foreground"
                  : order.paymentStatus === "submitted"
                  ? "bg-amber-500 text-white"
                  : order.paymentStatus === "rejected"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {order.paymentStatus === "submitted"
                ? "Menunggu Verifikasi"
                : order.paymentStatus === "approved"
                ? "Terverifikasi / Lunas"
                : order.paymentStatus === "rejected"
                ? "Ditolak"
                : "Menunggu Pembayaran"}
            </span>
          </div>
        </div>

        {/* PRATINJAU BUKTI TRANSFER DI DALAM DETAIL */}
        {order.paymentProof ? (
          <div className="mt-2 space-y-2 rounded border border-border bg-accent/20 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Foto Bukti Transfer
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onViewProof}
                  className="inline-flex items-center gap-1 text-xs text-foreground underline hover:text-lime"
                >
                  <Eye className="h-3 w-3" /> Perbesar
                </button>
                <a
                  href={order.paymentProof}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" /> Tab Baru
                </a>
              </div>
            </div>
            <div
              className="relative flex max-h-56 cursor-pointer items-center justify-center overflow-hidden rounded border border-border/80 bg-background p-1 transition-opacity hover:opacity-95"
              onClick={onViewProof}
              title="Klik untuk memperbesar"
            >
              <img
                src={order.paymentProof}
                alt={`Bukti transfer ${order.number}`}
                className="max-h-52 max-w-full rounded object-contain"
              />
            </div>
          </div>
        ) : order.paymentMethod === "transfer" ? (
          <p className="mt-2 rounded border border-dashed border-border p-3 text-center text-xs italic text-muted-foreground">
            Pelanggan belum mengunggah foto bukti transfer.
          </p>
        ) : null}

        {order.paymentStatus === "submitted" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85"
              onClick={() => onReview("approved")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Setujui Pembayaran
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 rounded-none"
              onClick={() => onReview("rejected")}
            >
              <XCircle className="mr-2 h-4 w-4" /> Tolak Pembayaran
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
