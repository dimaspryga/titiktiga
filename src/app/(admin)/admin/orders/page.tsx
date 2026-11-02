"use client";

import { useState } from "react";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderRepo } from "@/lib/repositories";
import { revalidateAll, useOrders } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { Order, OrderStatus } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders({ q: search || undefined, status, page, perPage: 6 });

  const changeStatus = async (id: string, next: OrderStatus) => {
    await orderRepo.updateStatus(id, next);
    revalidateAll();
  };

  const reviewPayment = async (id: string, paymentStatus: "approved" | "rejected") => {
    await orderRepo.reviewPayment(id, paymentStatus);
    revalidateAll();
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
        <Select value={status} onValueChange={(v) => { setStatus(v as OrderStatus | "all"); setPage(1); }}>
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
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">{t("admin.table.customer")}</th>
              <th className="px-4 py-3">{t("admin.table.date")}</th>
              <th className="px-4 py-3">{t("admin.table.total")}</th>
              <th className="px-4 py-3">{t("admin.table.status")}</th>
              <th className="px-4 py-3 text-right">{t("admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("loading")}</td>
              </tr>
            )}
            {(data?.items ?? []).map((order) => (
              <tr key={order.id} className="border-b border-border/60" data-testid={`admin-order-row-${order.number}`}>
                <td className="px-4 py-3 font-mono font-semibold">{order.number}</td>
                <td className="px-4 py-3">
                  <p>{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
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
                    <DialogContent className="rounded-none sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle data-testid="admin-order-detail-title">{order.number}</DialogTitle>
                      </DialogHeader>
                      <OrderDetail order={order} onReview={(status) => reviewPayment(order.id, status)} />
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between" data-testid="admin-orders-pagination">
        <Button variant="outline" size="sm" className="rounded-none" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} data-testid="admin-orders-prev">
          ← Sebelumnya
        </Button>
        <Button variant="outline" size="sm" className="rounded-none" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} data-testid="admin-orders-next">
          Selanjutnya →
        </Button>
      </div>
    </div>
  );
}

function OrderDetail({ order, onReview }: { order: Order; onReview: (status: "approved" | "rejected") => void }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4 text-sm" data-testid="admin-order-detail">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("admin.table.customer")}</p>
          <p>{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.customerEmail} — {order.customerPhone}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Alamat</p>
          <p className="text-xs leading-relaxed">{order.address}</p>
        </div>
      </div>
      <ul className="divide-y divide-border border-y border-border">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4 py-2" data-testid={`admin-order-item-${item.slug}`}>
            <span>{item.name} × {item.quantity}</span>
            <span>{formatIDR(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1">
        <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>{formatIDR(order.subtotal)}</span></div>
        {order.productDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.discount")}</span><span>−{formatIDR(order.productDiscount)}</span></div>}
        {order.voucherDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.voucher")} {order.voucherCode}</span><span>−{formatIDR(order.voucherDiscount)}</span></div>}
        <div className="flex justify-between pt-2 text-base font-semibold"><span>{t("cart.total")}</span><span>{formatIDR(order.total)}</span></div>
      </div>
      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pembayaran: {order.paymentStatus ?? "waiting"}</p>
          {order.paymentProof && <a className="text-xs underline" href={order.paymentProof} target="_blank" rel="noreferrer">Lihat bukti transfer</a>}
        </div>
        {order.paymentStatus === "submitted" && (
          <div className="flex gap-2">
            <Button size="sm" className="rounded-none" onClick={() => onReview("approved")}><CheckCircle2 className="mr-2 h-4 w-4" />Setujui</Button>
            <Button size="sm" variant="destructive" className="rounded-none" onClick={() => onReview("rejected")}><XCircle className="mr-2 h-4 w-4" />Tolak</Button>
          </div>
        )}
      </div>
    </div>
  );
}
