import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, Voucher } from "@/lib/types";
import { MAX_QUANTITY, validQuantity } from "@/lib/services/pricing";

interface CartState {
  items: CartItem[];
  voucherCode: string | null;
  appliedVoucher: Voucher | null;
  add: (item: CartItem) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  setVoucher: (code: string | null) => void;
  setAppliedVoucher: (voucher: Voucher | null) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      voucherCode: null,
      appliedVoucher: null,
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, stock: item.stock, price: item.price, discountPercent: item.discountPercent, category: item.category, quantity: validQuantity(i.quantity + item.quantity, item.stock) }
                  : i
              ),
            };
          }
          const quantity = validQuantity(item.quantity, item.stock);
          if (quantity < 1) return state;
          return { items: [...state.items, { ...item, quantity }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: validQuantity(quantity, i.stock) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setVoucher: (code) => set((state) => ({
        voucherCode: code,
        appliedVoucher: code ? state.appliedVoucher : null,
      })),
      setAppliedVoucher: (voucher) => set({ appliedVoucher: voucher }),
      clear: () => set({ items: [], voucherCode: null, appliedVoucher: null }),
    }),
    {
      name: "titiktiga.cart.v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const cartItemCount = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
