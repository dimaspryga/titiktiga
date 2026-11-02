"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { loginUrl, saveIntent } from "@/lib/services/intent";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

function useCartAction(product: Product) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);

  return (quantity: number, mode: "add" | "buy"): boolean => {
    if (product.stock <= 0) return false;
    if (!session) {
      saveIntent({
        type: mode === "buy" ? "buy-now" : "add-to-cart",
        productId: product.id,
        quantity,
      });
      router.push(loginUrl(mode === "buy" ? "/checkout" : window.location.pathname));
      return false;
    }
    useCartStore.getState().add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price,
      discountPercent: product.discountPercent,
      stock: product.stock,
      quantity,
    });
    return true;
  };
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "compact",
  className,
}: {
  product: Product;
  quantity?: number;
  variant?: "compact" | "full";
  className?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const act = useCartAction(product);
  const [busy, setBusy] = useState(false);
  const disabled = product.stock <= 0;

  const handle = () => {
    setBusy(true);
    const ok = act(quantity, "add");
    if (ok) {
      toast.success(product.name, {
        description: t("product.added"),
        action: { label: t("product.viewCart"), onClick: () => router.push("/cart") },
      });
    }
    setTimeout(() => setBusy(false), 300);
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        data-testid={`product-add-to-cart-${product.slug}`}
        aria-label={t("product.addToCart")}
        disabled={disabled || busy}
        onClick={handle}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center border border-foreground/20 bg-background transition-colors hover:bg-lime hover:text-lime-foreground disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button
      type="button"
      data-testid="product-add-to-cart-button"
      disabled={disabled || busy}
      onClick={handle}
      className={cn("h-12 flex-1 rounded-none bg-foreground text-background hover:bg-foreground/85", className)}
    >
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
      {disabled ? t("availability.outStock") : t("product.addToCart")}
    </Button>
  );
}

export function BuyNowButton({ product, quantity = 1 }: { product: Product; quantity?: number }) {
  const { t } = useI18n();
  const router = useRouter();
  const act = useCartAction(product);
  const [busy, setBusy] = useState(false);
  const disabled = product.stock <= 0;

  return (
    <Button
      type="button"
      data-testid="product-buy-now-button"
      disabled={disabled || busy}
      onClick={() => {
        setBusy(true);
        const ok = act(quantity, "buy");
        if (ok) {
          toast.success(product.name, { description: t("product.buyingNow") });
          router.push("/checkout");
        } else {
          setBusy(false);
        }
      }}
      className="h-12 flex-1 rounded-none bg-lime text-lime-foreground hover:bg-lime/85"
    >
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
      {t("product.buyNow")}
    </Button>
  );
}
