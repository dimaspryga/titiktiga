"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/stores/session";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", key: "admin.dashboard", icon: LayoutDashboard },
  { href: "/admin/products", key: "admin.products", icon: Package },
  { href: "/admin/categories", key: "admin.categories", icon: Tags },
  { href: "/admin/orders", key: "admin.orders", icon: ShoppingCart },
  { href: "/admin/customers", key: "admin.customers", icon: Users },
  { href: "/admin/vouchers", key: "admin.vouchers", icon: TicketPercent },
  { href: "/admin/promotions", key: "admin.promotions", icon: Megaphone },
  { href: "/admin/content", key: "admin.content", icon: FileText },
  { href: "/admin/settings", key: "admin.settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const logout = useSessionStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const current = NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sidebar = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-6 pt-8" data-testid="admin-logo-link">
          <LogoMark />
          <div className="leading-tight">
            <span className="block font-display text-lg font-semibold lowercase">titiktiga</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Admin Panel
            </span>
          </div>
        </Link>
        <nav className="mt-8 flex flex-col gap-1 px-3" aria-label="Admin">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`admin-nav-${item.href.replace("/admin/", "")}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-lime font-semibold text-lime-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          data-testid="admin-back-to-site"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Menu className="h-4 w-4" /> {t("admin.backToSite")}
        </Link>
        <button
          type="button"
          data-testid="admin-logout-button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-accent"
        >
          <LogOut className="h-4 w-4" /> {t("nav.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" data-testid="admin-shell">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
        {sidebar}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={t("nav.menu")}
              data-testid="admin-mobile-menu-button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Admin</span>
              <span className="mx-2 text-lime">/</span>
              <span className="text-foreground">{t(current?.key ?? "admin.dashboard")}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-lime px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-lime-foreground">
              {t("demo.badge")}
            </span>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 py-8 md:px-8" data-testid="admin-main">
          {children}
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" data-testid="admin-mobile-drawer">
          <button
            type="button"
            aria-label={t("nav.close")}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-card shadow-xl">
            <button
              type="button"
              aria-label={t("nav.close")}
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
