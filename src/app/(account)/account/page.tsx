"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/stores/session";

export default function AccountPage() {
  const { t } = useI18n();
  const session = useSessionStore((s) => s.session);

  return (
    <div className="space-y-8" data-testid="account-page">
      <div className="border border-border bg-card p-8" data-testid="account-info-card">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("account.info")}</h2>
        <dl className="mt-6 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3">
            <dt className="text-sm text-muted-foreground">{t("auth.name")}</dt>
            <dd className="font-medium" data-testid="account-name">{session?.name}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3">
            <dt className="text-sm text-muted-foreground">{t("auth.email")}</dt>
            <dd className="font-medium" data-testid="account-email">{session?.email}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-sm text-muted-foreground">{t("account.role")}</dt>
            <dd className="font-medium" data-testid="account-role">
              {session?.role === "admin" ? t("account.role.admin") : t("account.role.customer")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border border-border bg-card p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium">{t("account.orders")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("account.orders.empty.body")}</p>
          </div>
          <Button asChild variant="outline" className="rounded-none" data-testid="account-orders-link">
            <Link href="/orders">{t("account.orders")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="border border-border bg-card p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium">{t("nav.shop")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("cart.empty.body")}</p>
          </div>
          <Button asChild className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="account-shop-link">
            <Link href="/products" className="gap-2">
              <ShoppingBag className="h-4 w-4" /> {t("cart.empty.cta")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
