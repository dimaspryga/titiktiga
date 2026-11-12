import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import type { CartItem } from "@/lib/types";

const item = (id: string, quantity: number, stock = 10): CartItem => ({
  productId: id,
  slug: id,
  name: `Product ${id}`,
  image: "",
  price: 100000,
  discountPercent: null,
  stock,
  quantity,
});

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], voucherCode: null });
  });

  it("adds a new item", () => {
    useCartStore.getState().add(item("a", 2));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("merges duplicate adds instead of creating double entries", () => {
    useCartStore.getState().add(item("a", 1));
    useCartStore.getState().add(item("a", 2));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("clamps quantity to stock", () => {
    useCartStore.getState().add(item("a", 99, 5));
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    useCartStore.getState().setQuantity("a", 100);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("removes items", () => {
    useCartStore.getState().add(item("a", 1));
    useCartStore.getState().add(item("b", 1));
    useCartStore.getState().remove("a");
    expect(useCartStore.getState().items.map((i) => i.productId)).toEqual(["b"]);
  });

  it("clears everything including the voucher", () => {
    useCartStore.getState().add(item("a", 1));
    useCartStore.getState().setVoucher("TITIK20");
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().voucherCode).toBeNull();
  });

  it("clears persisted cart contents when the user logs out", () => {
    useCartStore.getState().add(item("a", 1));
    useCartStore.getState().setVoucher("TITIK20");
    useSessionStore.getState().logout();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().voucherCode).toBeNull();
  });
});
