import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Category,
  Customer,
  MockUser,
  Order,
  PortfolioProject,
  Product,
  Promotion,
  Service,
  SiteContent,
  Testimonial,
  Voucher,
} from "@/lib/types";
import { seedProducts, seedCategories } from "@/lib/mock/catalog";
import {
  seedContent,
  seedCustomers,
  seedOrders,
  seedPromotions,
  seedServices,
  seedPortfolio,
  seedTestimonials,
  seedUsers,
  seedVouchers,
} from "@/lib/mock/site";

export interface DbData {
  version: number;
  products: Product[];
  categories: Category[];
  vouchers: Voucher[];
  orders: Order[];
  customers: Customer[];
  users: MockUser[];
  services: Service[];
  portfolio: PortfolioProject[];
  testimonials: Testimonial[];
  promotions: Promotion[];
  content: SiteContent;
}

export type DbState = DbData & { reset: () => void };

function seedDb(): DbData {
  return {
    version: 1,
    products: seedProducts,
    categories: seedCategories,
    vouchers: seedVouchers,
    orders: seedOrders,
    customers: seedCustomers,
    users: seedUsers,
    services: seedServices,
    portfolio: seedPortfolio,
    testimonials: seedTestimonials,
    promotions: seedPromotions,
    content: seedContent,
  };
}

/**
 * Mock database — satu store Zustand yang dipersist ke localStorage.
 * Semua mock repository membaca/menulis lewat store ini sehingga perubahan
 * admin langsung tercermin di storefront selama persistence demo berjalan.
 * DEMO ONLY: data hilang jika storage dibersihkan; tidak untuk data nyata.
 */
export const useMockDb = create<DbState>()(
  persist(
    (set) => ({
      ...seedDb(),
      reset: () => set({ ...seedDb() }),
    }),
    {
      name: "titiktiga.db.v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
