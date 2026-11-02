"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Package, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth-guard";
import { SiteChrome } from "@/components/site-chrome";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/stores/session";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <RequireAuth returnTo="/account">
        <AccountShell>{children}</AccountShell>
      </RequireAuth>
    </SiteChrome>
  );
}

function AccountShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const logout = useSessionStore((s) => s.logout);

  const links = [
    { href: "/account", label: t("account.info"), icon: User },
    { href: "/orders", label: t("account.orders"), icon: Package },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">{t("account.title")}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside>
          <nav className="flex flex-col gap-1" aria-label="Akun" data-testid="account-nav">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`account-nav-${link.href.slice(1)}`}
                className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            ))}
            {session?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                data-testid="account-nav-admin"
                className="flex items-center gap-3 bg-lime px-3 py-2.5 text-sm font-semibold text-lime-foreground"
              >
                <Settings className="h-4 w-4" /> {t("account.adminPanel")}
              </Link>
            )}
            <button
              type="button"
              data-testid="account-logout-button"
              onClick={() => {
                logout();
                toast.success(t("auth.logout.success"));
                router.push("/");
              }}
              className="flex items-center gap-3 px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> {t("nav.logout")}
            </button>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
