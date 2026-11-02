"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo, LogoMark } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { usePromotions } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t, tt } = useI18n();
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const session = useSessionStore((s) => s.session);
  const { data: promotions } = usePromotions();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const announcement = promotions?.find((p) => p.placement === "announcement" && p.active);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/products", label: t("nav.shop") },
    // { href: "/about", label: t("nav.about") },
    { href: "/services", label: t("nav.services") },
    { href: "/portfolio", label: t("nav.portfolio") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40" data-testid="site-header">
      {announcement && (
        <div className="bg-foreground px-4 py-2 text-center" data-testid="announcement-strip">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-background md:text-xs">
            {tt(announcement.title)}
            {announcement.code ? <span className="text-lime"> — {announcement.code}</span> : null}
          </p>
        </div>
      )}
      <div
        className={cn(
          "border-b border-border bg-background/90 backdrop-blur-md transition-shadow duration-300",
          scrolled && "shadow-[0_1px_0_0_hsl(var(--border))]"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-8">
          <Link href="/" aria-label="Titiktiga — Beranda" data-testid="header-logo-link">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Utama">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`nav-link-${link.href.slice(1) || "home"}`}
                className={cn(
                  "link-underline text-sm font-medium tracking-wide",
                  pathname.startsWith(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/products"
              aria-label={t("nav.shop")}
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent md:flex"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/cart"
              aria-label={t("nav.cart")}
              data-testid="header-cart-link"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span
                  data-testid="cart-badge-count"
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 font-mono text-[10px] font-semibold text-lime-foreground"
                >
                  {count}
                </span>
              )}
            </Link>
            <Link
              href={session ? "/account" : "/login"}
              aria-label={session ? t("nav.account") : t("nav.login")}
              data-testid="header-account-link"
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent md:flex"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <button
              type="button"
              aria-label={open ? t("nav.close") : t("nav.menu")}
              aria-expanded={open}
              data-testid="mobile-menu-button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-background px-6 pb-10 pt-6 lg:hidden"
            data-testid="mobile-menu"
          >
            {/* Header row inside overlay: logo + close button */}
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" aria-label="Titiktiga — Beranda" onClick={() => setOpen(false)}>
                <Logo />
              </Link>
              <button
                type="button"
                aria-label={t("nav.close")}
                data-testid="mobile-menu-close"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {[{ href: "/", label: t("nav.home") }, ...links].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                >
                  <Link
                    href={link.href}
                    data-testid={`mobile-nav-link-${link.href === "/" ? "home" : link.href.slice(1)}`}
                    className="block border-b border-border py-4 font-display text-4xl font-medium"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <LanguageToggle />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("demo.badge")} — {new Date().getFullYear()}
                </span>
              </div>
              <div className="flex gap-3">
                <Link
                  href={session ? "/account" : "/login"}
                  data-testid="mobile-account-link"
                  className="flex h-12 flex-1 items-center justify-center gap-2 border border-foreground bg-foreground text-sm font-semibold text-background"
                >
                  <User className="h-4 w-4" /> {session ? t("nav.account") : t("nav.login")}
                </Link>
                <Link
                  href="/cart"
                  data-testid="mobile-cart-link"
                  className="flex h-12 flex-1 items-center justify-center gap-2 bg-lime text-sm font-semibold text-lime-foreground"
                >
                  <ShoppingBag className="h-4 w-4" /> {t("nav.cart")}
                  {count > 0 ? ` (${count})` : ""}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
