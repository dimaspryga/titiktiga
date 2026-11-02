"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { CountUp, Reveal } from "@/components/motion";
import { useProducts, useOrders, useCustomers } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const { data: products } = useProducts({ includeDrafts: true, perPage: 200 });
  const { data: orders } = useOrders({ perPage: 100 });
  const { data: customers } = useCustomers();

  const allOrders = orders?.items ?? [];
  const revenue = allOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const activeProducts = (products?.items ?? []).filter((p) => p.status === "active").length;
  const lowStock = (products?.items ?? []).filter((p) => p.stock <= 10).slice(0, 5);

  const stats = [
    { id: "revenue", label: t("admin.stats.revenue"), value: revenue, prefix: "", icon: TrendingUp, isCurrency: true },
    { id: "orders", label: t("admin.stats.orders"), value: orders?.total ?? 0, icon: ShoppingCart, isCurrency: false },
    { id: "customers", label: t("admin.stats.customers"), value: customers?.length ?? 0, icon: Users, isCurrency: false },
    { id: "products", label: t("admin.stats.products"), value: activeProducts, icon: Package, isCurrency: false },
  ];

  return (
    <div className="space-y-10" data-testid="admin-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.dashboard")}</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {t("demo.badge")} — data mock di browser
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="border border-border bg-card p-6" data-testid={`admin-stat-${stat.id}`}>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
            <p className="mt-4 font-display text-4xl font-medium">
              {stat.isCurrency ? (
                formatIDR(revenue)
              ) : (
                <CountUp value={stat.value} />
              )}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <Reveal className="xl:col-span-2">
          <div className="border border-border bg-card" data-testid="admin-recent-orders">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-xl font-medium">{t("admin.stats.recent")}</h2>
              <Link href="/admin/orders" className="link-underline flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em]">
                {t("admin.orders")} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {allOrders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm" data-testid={`admin-recent-order-${order.number}`}>
                  <div>
                    <p className="font-mono font-semibold">{order.number}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <StatusChip status={order.status} label={t(`status.${order.status}`)} />
                  <p className="font-semibold">{formatIDR(order.total)}</p>
                </li>
              ))}
              {allOrders.length === 0 && <li className="px-6 py-8 text-center text-sm text-muted-foreground">—</li>}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border border-border bg-card" data-testid="admin-low-stock">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 font-display text-xl font-medium">
                <AlertTriangle className="h-4 w-4 text-lime-foreground [color:hsl(var(--foreground))]" /> {t("admin.stats.lowStock")}
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-4 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className={`shrink-0 font-mono font-bold ${p.stock === 0 ? "text-destructive" : ""}`} data-testid={`admin-low-stock-${p.slug}`}>
                    {p.stock}
                  </span>
                </li>
              ))}
              {lowStock.length === 0 && <li className="px-6 py-8 text-center text-sm text-muted-foreground">—</li>}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function StatusChip({ status, label }: { status: OrderStatus; label: string }) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-muted text-foreground",
    processing: "border border-foreground",
    shipped: "bg-foreground text-background",
    completed: "bg-lime text-lime-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };
  return <span className={`px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${styles[status]}`}>{label}</span>;
}
