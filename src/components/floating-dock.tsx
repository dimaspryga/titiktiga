"use client";

import { BriefcaseBusiness, Home, Mail, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useOrders } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/stores/session";
import { cn } from "@/lib/utils";

const HOME_LINKS = [
  { anchor: "#overview", labelKey: "nav.home", icon: Home },
  { anchor: "#works", labelKey: "nav.portfolio", icon: BriefcaseBusiness },
  { anchor: "#market", labelKey: "nav.products", icon: ShoppingBag },
  { anchor: "#services", labelKey: "nav.services", icon: Sparkles },
  { anchor: "#studio", labelKey: "nav.about", icon: Mail },
] as const;

const DOCK_CLASS_NAME =
  "fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full border border-border/80 bg-background/85 p-1.5 shadow-xl shadow-foreground/10 backdrop-blur-xl";

export function FloatingDock() {
  const { t } = useI18n();
  const pathname = usePathname();
  const session = useSessionStore((state) => state.session);
  const [activeSection, setActiveSection] = useState("#overview");
  const isHome = pathname === "/";
  const isProducts = pathname === "/products";

  useEffect(() => {
    if (!isHome) return;
    const sections = HOME_LINKS.map(({ anchor }) => document.querySelector(anchor)).filter(
      (section): section is Element => section !== null
    );
    if (sections.length === 0) return;

    let frameId: number | null = null;
    const updateActiveSection = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const viewportCenter = window.innerHeight / 2;
        const currentSection = sections.find((section) => {
          const bounds = section.getBoundingClientRect();
          return bounds.top <= viewportCenter && bounds.bottom >= viewportCenter;
        });
        if (currentSection) setActiveSection(`#${currentSection.id}`);
      });
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    updateActiveSection();
    const hash = window.location.hash;
    if (HOME_LINKS.some(({ anchor }) => anchor === hash)) setActiveSection(hash);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [isHome]);

  if (!isHome && !isProducts) return null;

  if (isProducts) {
    return (
      <DockNav label={t("nav.orders")}>
        <DockLink href="/" label={t("nav.home")} icon={Home} active={false} />
        {session?.email ? (
          <OrdersDockLink email={session.email} label={t("nav.orders")} />
        ) : (
          <DockLink
            href="/orders"
            label={t("nav.orders")}
            icon={ShoppingBag}
            active={false}
            alwaysShowLabel
          />
        )}
      </DockNav>
    );
  }

  return (
    <DockNav label={t("nav.home")}>
      {HOME_LINKS.map(({ anchor, labelKey, icon }) => {
        const label = t(labelKey);
        const active = activeSection === anchor;
        return (
          <DockLink
            key={anchor}
            href={anchor}
            label={label}
            icon={icon}
            active={active}
          />
        );
      })}
    </DockNav>
  );
}

function DockNav({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className={DOCK_CLASS_NAME} data-testid="floating-dock">
      {children}
    </nav>
  );
}

function OrdersDockLink({ email, label }: { email: string; label: string }) {
  const { t } = useI18n();
  const pending = useOrders({ email, status: "pending", page: 1, perPage: 1 });
  const processing = useOrders({ email, status: "processing", page: 1, perPage: 1 });
  const shipped = useOrders({ email, status: "shipped", page: 1, perPage: 1 });
  const failed = pending.isError || processing.isError || shipped.isError;
  const count = (pending.data?.total ?? 0) + (processing.data?.total ?? 0) + (shipped.data?.total ?? 0);
  const countLabel = failed ? "!" : pending.isLoading || processing.isLoading || shipped.isLoading ? "…" : count;

  return (
    <DockLink
      href="/orders"
      label={label}
      icon={ShoppingBag}
      active={false}
      badge={countLabel}
      badgeLabel={failed ? t("orders.loadError") : t("orders.results", { count })}
      alwaysShowLabel
    />
  );
}

function DockLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  badgeLabel,
  alwaysShowLabel = false,
  ariaCurrent,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  badge?: string | number;
  badgeLabel?: string;
  alwaysShowLabel?: boolean;
  ariaCurrent?: "page";
}) {
  return (
    <Link
      href={href}
      aria-label={badge !== undefined ? `${label}, ${badgeLabel}` : label}
      aria-current={active ? "location" : ariaCurrent}
      className={cn(
        "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-xs font-medium transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className={alwaysShowLabel ? "inline" : "hidden sm:inline"}>{label}</span>
      {badge !== undefined && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1.5 font-mono text-[10px] font-semibold text-lime-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}
