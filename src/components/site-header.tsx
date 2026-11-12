"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Menu, Minus, Plus, Search, ShoppingBag, TicketPercent, User, X } from "lucide-react";
import { Logo, LogoMark } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useCartStore } from "@/lib/stores/cart";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSessionStore } from "@/lib/stores/session";
import { useContent, usePromotions } from "@/lib/hooks";
import { voucherRepo } from "@/lib/repositories";
import { computeTotals, unitPrice } from "@/lib/services/pricing";
import { cn, formatIDR } from "@/lib/utils";
import { toast } from "sonner";

export function SiteHeader() {
  const { t, tt } = useI18n();
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const session = useSessionStore((s) => s.session);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const voucherCode = useCartStore((s) => s.voucherCode);
  const appliedVoucher = useCartStore((s) => s.appliedVoucher);
  const setVoucher = useCartStore((s) => s.setVoucher);
  const setAppliedVoucher = useCartStore((s) => s.setAppliedVoucher);
  const { data: promotions } = usePromotions();
  const { data: content } = useContent();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const categorySlugs = [...new Set(items.map((item) => item.category).filter((category): category is string => Boolean(category)))];
  const voucherQuery = useQuery({
    queryKey: ["vouchers"],
    queryFn: voucherRepo.list,
    enabled: cartOpen && items.length > 0,
    staleTime: 30_000,
  });
  const voucher =
    appliedVoucher?.code.toUpperCase() === (voucherCode ?? "").toUpperCase()
      ? appliedVoucher
      : voucherQuery.data?.find((v) => v.code.toUpperCase() === (voucherCode ?? "").toUpperCase());
  const totals = computeTotals(items, voucher, {
    shippingFee: content?.store.shippingFee ?? 25000,
    freeShippingThreshold: content?.store.freeShippingThreshold ?? 1000000,
    categorySlugs,
  });
  const announcement = promotions?.find((p) => p.placement === "announcement" && p.active);

  const applyVoucher = async () => {
    if (!voucherInput.trim()) return;
    const result = await voucherRepo.check(voucherInput, totals.subtotal, categorySlugs);
    if (result.ok) {
      setVoucher(result.voucher.code);
      setAppliedVoucher(result.voucher);
      toast.success(t("cart.voucherApplied", { code: result.voucher.code }));
      setVoucherInput("");
      return;
    }
    toast.error(t(`voucher.error.${result.error}`));
  };

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/products", label: t("nav.market") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/about", label: t("nav.about") },
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
          "relative z-50 border-b border-border bg-background/90 backdrop-blur-md transition-shadow duration-300",
          scrolled && "shadow-[0_1px_0_0_hsl(var(--border))]"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-8">
          <Link href="/" aria-label="Titiktiga — Beranda" data-testid="header-logo-link">
            <Logo />
          </Link>
          <p className="hidden items-center gap-2 border-l border-border pl-4 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
            {tt(content?.hero.eyebrow)}
          </p>

          <nav className="hidden items-center gap-5 lg:flex" aria-label="Utama">
            {links.filter((link) => ["/portfolio", "/services", "/products"].includes(link.href)).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`nav-link-${link.href.slice(1) || "home"}`}
                className={cn(
                  "link-underline text-xs font-medium tracking-wide xl:text-sm",
                  pathname.startsWith(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form action="/products" role="search" className="hidden min-w-36 max-w-48 flex-1 lg:block">
            <label className="relative block">
              <span className="sr-only">{t("products.searchPlaceholder")}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder={t("products.searchPlaceholder")}
                className="h-10 w-full rounded-full border border-border bg-card/60 pl-9 pr-4 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                data-testid="header-search-input"
              />
            </label>
          </form>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/products"
              aria-label={t("nav.shop")}
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent md:flex lg:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <LanguageToggle />
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
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
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[min(100vw,28rem)] flex-col rounded-l-2xl border-l border-border p-0">
                <div className="border-b border-border px-6 py-6">
                  <SheetTitle className="font-display text-3xl font-medium">{t("cart.title")}</SheetTitle>
                  <SheetDescription className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t("cart.itemCount", { count })}
                  </SheetDescription>
                  <Link
                    href="/cart"
                    onClick={() => setCartOpen(false)}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-medium transition-colors hover:bg-accent"
                    data-testid="drawer-cart-page-link"
                  >
                    {t("cart.viewFullCart")}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
                {items.length > 0 ? (
                  <>
                    <ul className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                      {items.map((item) => (
                        <li key={item.productId} className="flex gap-4 border-b border-border pb-5">
                          <Link href={`/products/${item.slug}`} onClick={() => setCartOpen(false)} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {item.image && (
                              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                            )}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link href={`/products/${item.slug}`} onClick={() => setCartOpen(false)} className="line-clamp-2 font-medium hover:underline">
                              {item.name}
                            </Link>
                            <p className="mt-1 font-mono text-xs">{formatIDR(unitPrice(item.price, item.discountPercent))}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center rounded-full border border-border">
                                <button
                                  type="button"
                                  aria-label={`${t("cart.quantity")} − ${item.name}`}
                                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center font-mono text-xs">{item.quantity}</span>
                                <button
                                  type="button"
                                  aria-label={`${t("cart.quantity")} + ${item.name}`}
                                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <button type="button" onClick={() => remove(item.productId)} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                                {t("cart.remove")}
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border bg-card px-6 py-5">
                      <div className="mb-4 border-b border-border pb-4">
                        <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          <TicketPercent className="h-4 w-4" /> {t("cart.voucher")}
                        </p>
                        {voucherCode && voucher ? (
                          <div className="flex items-center justify-between gap-3 border border-lime bg-lime/10 px-3 py-2" data-testid="drawer-voucher-applied">
                            <span className="min-w-0 truncate text-xs font-medium">{t("cart.voucherApplied", { code: voucher.code })}</span>
                            <button
                              type="button"
                              data-testid="drawer-voucher-remove"
                              onClick={() => setVoucher(null)}
                              className="shrink-0 font-mono text-[10px] uppercase tracking-widest underline"
                            >
                              {t("cart.voucherRemove")}
                            </button>
                          </div>
                        ) : (
                          <div className="flex min-w-0 gap-2">
                            <Input
                              value={voucherInput}
                              onChange={(event) => setVoucherInput(event.target.value.toUpperCase())}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void applyVoucher();
                                }
                              }}
                              placeholder={t("cart.voucherPlaceholder")}
                              data-testid="drawer-voucher-input"
                              className="h-10 min-w-0 rounded-full font-mono text-xs"
                            />
                            <button
                              type="button"
                              data-testid="drawer-voucher-apply"
                              onClick={() => void applyVoucher()}
                              className="shrink-0 rounded-full border border-border px-4 text-xs font-medium transition-colors hover:bg-accent"
                            >
                              {t("cart.voucherApply")}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mb-4 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span>{t("cart.subtotal")}</span>
                          <span>{formatIDR(totals.subtotal)}</span>
                        </div>
                        {totals.voucherDiscount > 0 && (
                          <div className="flex items-center justify-between text-lime">
                            <span>{t("cart.voucher")}</span>
                            <span>−{formatIDR(totals.voucherDiscount)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-border pt-2 font-semibold">
                          <span>{t("cart.total")}</span>
                          <span>{formatIDR(totals.total)}</span>
                        </div>
                      </div>
                      <Link href="/products" onClick={() => setCartOpen(false)} className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5">
                        {t("cart.continue")}
                      </Link>
                      <Link href="/checkout" onClick={() => setCartOpen(false)} className="mt-2 flex h-12 items-center justify-center rounded-full bg-lime px-6 text-sm font-semibold text-lime-foreground transition-transform hover:-translate-y-0.5">
                        {t("cart.checkout")}
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                    <h3 className="mt-4 font-display text-2xl">{t("cart.empty.title")}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t("cart.empty.body")}</p>
                    <Link href="/products" onClick={() => setCartOpen(false)} className="mt-6 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-lime-foreground">
                      {t("cart.empty.cta")}
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            <Link
              href={session ? "/account" : "/login"}
              aria-label={session ? t("nav.account") : t("nav.login")}
              data-testid="header-account-link"
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent md:flex"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/contact"
              className="hidden h-10 items-center gap-2 rounded-full bg-lime px-4 text-xs font-semibold text-lime-foreground transition-transform hover:-translate-y-0.5 hover:bg-lime/90 lg:inline-flex"
              data-testid="header-contact-cta"
            >
              {t("nav.contact")} <ArrowUpRight className="h-3.5 w-3.5" />
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
            className="fixed inset-x-0 top-16 bottom-0 z-30 flex flex-col justify-between overflow-y-auto bg-background px-6 pb-10 pt-8 lg:hidden"
            data-testid="mobile-menu"
          >
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
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Titiktiga Studio — {new Date().getFullYear()}
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
