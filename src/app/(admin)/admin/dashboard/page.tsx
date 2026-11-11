"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowUpRight, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { CountUp, Reveal } from "@/components/motion";
import { useProducts, useOrders, useCustomers } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<"all" | "year" | "month" | "day">("all");
  const [dateValue, setDateValue] = useState("");
  const { data: products } = useProducts({ includeDrafts: true, perPage: 200 });
  const { data: orders } = useOrders({ perPage: 1000 });
  const { data: customers } = useCustomers();

  const allOrders = orders?.items ?? [];
  const filteredOrders = allOrders.filter((order) => {
    if (!dateValue) return true;
    const date = String(order.createdAt).slice(0, 10);
    if (period === "day") return date === dateValue;
    if (period === "month") return date.slice(0, 7) === dateValue;
    if (period === "year") return date.slice(0, 4) === dateValue.slice(0, 4);
    return true;
  });
  const revenue = filteredOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const salesChart = buildSalesChart(filteredOrders, period);
  const periodLabels: Record<typeof period, string> = {
    all: t("admin.report.allTime"),
    year: t("admin.report.byYear"),
    month: t("admin.report.byMonth"),
    day: t("admin.report.byDay"),
  };
  const activeProducts = (products?.items ?? []).filter((p) => p.status === "active").length;
  const lowStock = (products?.items ?? []).filter((p) => p.stock <= 10).slice(0, 5);

  const stats = [
    { id: "revenue", label: t("admin.stats.revenue"), value: revenue, prefix: "", icon: TrendingUp, isCurrency: true },
    { id: "orders", label: t("admin.stats.orders"), value: filteredOrders.length, icon: ShoppingCart, isCurrency: false },
    { id: "customers", label: t("admin.stats.customers"), value: customers?.length ?? 0, icon: Users, isCurrency: false },
    { id: "products", label: t("admin.stats.products"), value: activeProducts, icon: Package, isCurrency: false },
  ];

  return (
    <div className="space-y-10" data-testid="admin-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.dashboard")}</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {t("admin.report.liveData")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="border border-border bg-card p-6" data-testid={`admin-stat-${stat.id}`}>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
            <p className="mt-4 font-display text-4xl font-medium">
              {stat.isCurrency ? (
                formatIDR(stat.value)
              ) : (
                <CountUp value={stat.value} />
              )}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card" data-testid="admin-sales-report">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("admin.report.transactionSummary")}</p>
                <h2 className="mt-1 font-display text-xl font-medium">{t("admin.report.salesAndRevenue")}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "year", "month", "day"] as const).map((item) => (
                  <button key={item} type="button" onClick={() => { setPeriod(item); setDateValue(""); }} className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-wider ${period === item ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}>
                    {periodLabels[item]}
                  </button>
                ))}
                {period !== "all" && (
                  <input
                    type={period === "month" ? "month" : period === "day" ? "date" : "number"}
                    value={dateValue}
                    onChange={(event) => setDateValue(event.target.value)}
                    min={period === "year" ? "2000" : undefined}
                    max={period === "year" ? "2100" : undefined}
                    className="h-8 border border-border bg-background px-3 text-sm"
                    aria-label={`Filter ${periodLabels[period]}`}
                  />
                )}
              </div>
            </div>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="h-72 border-b border-border p-5 md:border-b-0 md:border-r" data-testid="admin-revenue-chart">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("admin.report.revenue")} · {formatIDR(revenue)}</p>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                    <Tooltip formatter={(value) => formatIDR(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" fill="hsl(var(--lime))" fillOpacity={0.45} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-72 p-5" data-testid="admin-sales-chart">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("admin.report.salesCount")} · {filteredOrders.length} {t("admin.report.transactions")}</p>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="orders" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.18} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
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
              {filteredOrders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm" data-testid={`admin-recent-order-${order.number}`}>
                  <div>
                    <p className="font-mono font-semibold">{order.number}</p>
                    <p className="text-xs text-muted-foreground">{order.customerName}</p>
                  </div>
                  <StatusChip status={order.status} label={t(`status.${order.status}`)} />
                  <p className="font-semibold">{formatIDR(order.total)}</p>
                </li>
              ))}
              {filteredOrders.length === 0 && <li className="px-6 py-8 text-center text-sm text-muted-foreground">—</li>}
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

function buildSalesChart(orders: Array<{ createdAt: string; total: number; status: OrderStatus }>, period: "all" | "year" | "month" | "day") {
  const buckets = new Map<string, { label: string; revenue: number; orders: number }>();
  const orderDate = (value: string) => new Date(value).getTime();
  const sorted = [...orders].sort((a, b) => orderDate(a.createdAt) - orderDate(b.createdAt));
  sorted.forEach((order) => {
    const date = String(order.createdAt).slice(0, 10);
    const key = period === "day"
      ? String(order.createdAt).slice(11, 16) || date
      : period === "month"
        ? date.slice(8, 10)
        : period === "year"
          ? date.slice(5, 7)
          : date.slice(0, 4);
    const bucket = buckets.get(key) ?? { label: key, revenue: 0, orders: 0 };
    bucket.orders += 1;
    if (order.status !== "cancelled") bucket.revenue += Number(order.total);
    buckets.set(key, bucket);
  });
  return [...buckets.values()];
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
