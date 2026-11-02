"use client";

import useSWR, { mutate as globalMutate } from "swr";
import {
  categoryRepo,
  contentRepo,
  customerRepo,
  orderRepo,
  portfolioRepo,
  productRepo,
  promotionRepo,
  serviceRepo,
  testimonialRepo,
  voucherRepo,
  type OrderQuery,
} from "@/lib/repositories";
import type { ProductQuery } from "@/lib/types";

export function revalidateAll() {
  void globalMutate(() => true, undefined, { revalidate: true });
}

export const useProducts = (query: ProductQuery = {}) =>
  useSWR(["products", JSON.stringify(query)], () => productRepo.list(query), {
    keepPreviousData: true,
  });

export const useProduct = (slug?: string) =>
  useSWR(slug ? ["product", slug] : null, () => productRepo.getBySlug(slug!));

export const useCategories = () => useSWR("categories", () => categoryRepo.list());

export const useContent = () => useSWR("content", () => contentRepo.get());

export const useVouchers = () => useSWR("vouchers", () => voucherRepo.list());

export const useOrders = (query: OrderQuery = {}) =>
  useSWR(["orders", JSON.stringify(query)], () => orderRepo.list(query), { keepPreviousData: true });

export const useCustomers = () => useSWR("customers", () => customerRepo.list());

export const useServices = () => useSWR("services", () => serviceRepo.list());

export const usePortfolio = () => useSWR("portfolio", () => portfolioRepo.list());

export const usePortfolioProject = (slug?: string) =>
  useSWR(slug ? ["portfolio", slug] : null, () => portfolioRepo.getBySlug(slug!));

export const useTestimonials = () => useSWR("testimonials", () => testimonialRepo.list());

export const usePromotions = () => useSWR("promotions", () => promotionRepo.list());
