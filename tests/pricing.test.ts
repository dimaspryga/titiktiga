import { describe, expect, it } from "vitest";
import {
  computeSubtotal,
  computeTotals,
  computeVoucherDiscount,
  isVoucherApplicable,
  isVoucherValid,
  unitPrice,
  validQuantity,
} from "@/lib/services/pricing";
import type { CartItem, Voucher } from "@/lib/types";

const item = (price: number, quantity: number, discountPercent: number | null = null): CartItem => ({
  productId: "p1",
  slug: "p1",
  name: "Product 1",
  image: "",
  price,
  discountPercent,
  stock: 50,
  quantity,
});

const voucher = (patch: Partial<Voucher> = {}): Voucher => ({
  id: "v1",
  code: "TEST",
  type: "percentage",
  value: 10,
  minPurchase: 0,
  maxDiscount: null,
  startDate: "2025-01-01",
  expiryDate: "2030-12-31",
  usageLimit: null,
  usedCount: 0,
  active: true,
  eligibleCategories: null,
  ...patch,
});

describe("unitPrice", () => {
  it("returns base price without discount", () => {
    expect(unitPrice(100000, null)).toBe(100000);
    expect(unitPrice(100000, 0)).toBe(100000);
  });
  it("applies percentage discount rounded", () => {
    expect(unitPrice(99000, 10)).toBe(89100);
    expect(unitPrice(149000, 15)).toBe(126650);
  });
});

describe("computeSubtotal", () => {
  it("sums discounted line totals", () => {
    expect(computeSubtotal([item(100000, 2), item(50000, 1, 20)])).toBe(240000);
  });
});

describe("voucher validation", () => {
  it("rejects inactive vouchers", () => {
    expect(isVoucherValid(voucher({ active: false }))).toBe(false);
  });
  it("rejects expired and not-yet-started vouchers", () => {
    expect(isVoucherValid(voucher({ expiryDate: "2020-01-01" }))).toBe(false);
    expect(isVoucherValid(voucher({ startDate: "2090-01-01" }))).toBe(false);
  });
  it("rejects exhausted usage limit", () => {
    expect(isVoucherValid(voucher({ usageLimit: 10, usedCount: 10 }))).toBe(false);
    expect(isVoucherValid(voucher({ usageLimit: 10, usedCount: 9 }))).toBe(true);
  });
});

describe("voucher applicability", () => {
  it("requires minimum purchase", () => {
    expect(isVoucherApplicable(voucher({ minPurchase: 300000 }), 250000)).toBe(false);
    expect(isVoucherApplicable(voucher({ minPurchase: 300000 }), 300000)).toBe(true);
  });
  it("checks category eligibility", () => {
    const v = voucher({ eligibleCategories: ["poster"] });
    expect(isVoucherApplicable(v, 100000, ["stationery"])).toBe(false);
    expect(isVoucherApplicable(v, 100000, ["poster", "objek"])).toBe(true);
  });
});

describe("computeVoucherDiscount", () => {
  it("computes percentage with maximum cap", () => {
    expect(computeVoucherDiscount(voucher({ value: 20, maxDiscount: 100000 }), 1000000)).toBe(100000);
    expect(computeVoucherDiscount(voucher({ value: 20, maxDiscount: 100000 }), 400000)).toBe(80000);
  });
  it("computes fixed discount", () => {
    expect(computeVoucherDiscount(voucher({ type: "fixed", value: 50000 }), 250000)).toBe(50000);
  });
  it("never exceeds subtotal or goes negative", () => {
    expect(computeVoucherDiscount(voucher({ type: "fixed", value: 500000 }), 250000)).toBe(250000);
    expect(computeVoucherDiscount(voucher({ active: false }), 250000)).toBe(0);
  });
});

describe("computeTotals", () => {
  it("combines product discount, voucher, and shipping", () => {
    const totals = computeTotals([item(100000, 2, 10)], voucher({ value: 20, maxDiscount: 100000 }), {
      shippingFee: 25000,
      freeShippingThreshold: 1000000,
    });
    expect(totals.subtotal).toBe(180000);
    expect(totals.productDiscount).toBe(20000);
    expect(totals.voucherDiscount).toBe(36000);
    expect(totals.shippingFee).toBe(25000);
    expect(totals.total).toBe(180000 - 36000 + 25000);
  });
  it("gives free shipping above threshold", () => {
    const totals = computeTotals([item(1200000, 1)], voucher({ value: 10 }), {
      shippingFee: 25000,
      freeShippingThreshold: 1000000,
    });
    expect(totals.freeShipping).toBe(true);
    expect(totals.shippingFee).toBe(0);
  });
  it("never produces negative totals", () => {
    const totals = computeTotals([item(50000, 1)], voucher({ type: "fixed", value: 999999 }), {
      shippingFee: 25000,
      freeShippingThreshold: 1000000,
    });
    expect(totals.voucherDiscount).toBe(50000);
    expect(totals.subtotal - totals.voucherDiscount).toBe(0);
    expect(totals.total).toBeGreaterThanOrEqual(0);
  });
  it("ignores voucher that is not applicable", () => {
    const totals = computeTotals([item(100000, 1)], voucher({ minPurchase: 500000 }), {
      shippingFee: 25000,
      freeShippingThreshold: 1000000,
    });
    expect(totals.voucherDiscount).toBe(0);
  });
});

describe("validQuantity", () => {
  it("clamps to stock and max", () => {
    expect(validQuantity(5, 3)).toBe(3);
    expect(validQuantity(0, 10)).toBe(1);
    expect(validQuantity(9999, 50)).toBe(50);
    expect(validQuantity(NaN, 10)).toBe(0);
  });
});
