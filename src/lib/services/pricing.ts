import type { CartItem, CartTotals, Voucher } from "@/lib/types";

export const MAX_QUANTITY = 99;

export function unitPrice(price: number, discountPercent: number | null | undefined): number {
  const d = discountPercent ?? 0;
  if (d <= 0) return price;
  return Math.round(price * (1 - Math.min(d, 100) / 100));
}

export function lineSubtotal(item: Pick<CartItem, "price" | "discountPercent" | "quantity">): number {
  return unitPrice(item.price, item.discountPercent) * item.quantity;
}

export function computeSubtotal(items: Pick<CartItem, "price" | "discountPercent" | "quantity">[]): number {
  return items.reduce((sum, item) => sum + lineSubtotal(item), 0);
}

export function isVoucherValid(voucher: Voucher | null | undefined, now: Date = new Date()): boolean {
  if (!voucher || !voucher.active) return false;
  const start = new Date(voucher.startDate);
  const end = new Date(voucher.expiryDate);
  end.setHours(23, 59, 59, 999);
  if (now < start || now > end) return false;
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) return false;
  return true;
}

export function isVoucherApplicable(
  voucher: Voucher | null | undefined,
  subtotal: number,
  categorySlugs: string[] = []
): boolean {
  if (!voucher) return false;
  if (subtotal < voucher.minPurchase) return false;
  if (voucher.eligibleCategories && voucher.eligibleCategories.length > 0) {
    return categorySlugs.some((c) => voucher.eligibleCategories!.includes(c));
  }
  return true;
}

export function computeVoucherDiscount(voucher: Voucher | null | undefined, subtotal: number): number {
  if (!voucher || !isVoucherValid(voucher)) return 0;
  let discount =
    voucher.type === "percentage" ? Math.round((subtotal * voucher.value) / 100) : Math.round(voucher.value);
  if (voucher.type === "percentage" && voucher.maxDiscount != null) {
    discount = Math.min(discount, voucher.maxDiscount);
  }
  return Math.max(0, Math.min(discount, subtotal));
}

export interface TotalsOptions {
  shippingFee: number;
  freeShippingThreshold: number;
  categorySlugs?: string[];
}

export function computeTotals(
  items: CartItem[],
  voucher: Voucher | null | undefined,
  opts: TotalsOptions
): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const grossTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = computeSubtotal(items);
  const productDiscount = grossTotal - subtotal;
  const voucherDiscount = isVoucherApplicable(voucher, subtotal, opts.categorySlugs ?? [])
    ? computeVoucherDiscount(voucher, subtotal)
    : 0;
  const afterDiscounts = subtotal - voucherDiscount;
  const freeShipping = true;
  const shippingFee = 0;
  const total = Math.max(0, afterDiscounts + shippingFee);
  return { itemCount, subtotal, productDiscount, voucherDiscount, shippingFee, total, freeShipping };
}

export function validQuantity(quantity: number, stock: number): number {
  if (!Number.isFinite(quantity)) return 0;
  const rounded = Math.round(quantity);
  if (rounded < 1) return stock > 0 ? 1 : 0;
  return Math.min(rounded, stock, MAX_QUANTITY);
}
