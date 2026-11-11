"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate as globalMutate } from "swr";
import { invalidateAllQueries } from "@/lib/query-client";
import {
  categoryRepo,
  contentRepo,
  customerRepo,
  engagementRepo,
  orderRepo,
  portfolioRepo,
  productRepo,
  promotionRepo,
  serviceRepo,
  testimonialRepo,
  voucherRepo,
  midtransRepo,
  type MidtransStatus,
  type MidtransTokenResult,
  type OrderQuery,
  type VoucherCheck,
} from "@/lib/repositories";
import type {
  Category,
  Customer,
  EngagementContent,
  Order,
  OrderInput,
  Paged,
  PortfolioProject,
  Product,
  ProductInput,
  ProductQuery,
  Promotion,
  Service,
  SiteContent,
  Testimonial,
  Voucher,
} from "@/lib/types";

// Invalidate both TanStack Query and SWR caches across the application
export function revalidateAll() {
  invalidateAllQueries();
  void globalMutate(() => true, undefined, { revalidate: true });
}

// ============================================================================
// 1. PRODUCTS HOOKS
// ============================================================================
export function useProductsQuery(query: ProductQuery = {}) {
  return useQuery<Paged<Product>>({
    queryKey: ["products", query],
    queryFn: () => productRepo.list(query),
    placeholderData: (previousData) => previousData,
  });
}

export function useProducts(query: ProductQuery = {}) {
  const queryClient = useQueryClient();
  const q = useProductsQuery(query);

  const createMutation = useMutation({
    mutationFn: (input: ProductInput) => productRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ProductInput> }) => productRepo.update(id, patch),
    onSuccess: () => revalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productRepo.remove(id),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    items: q.data?.items ?? [],
    total: q.data?.total ?? 0,
    page: q.data?.page ?? 1,
    perPage: q.data?.perPage ?? 8,
    hasMore: q.data?.hasMore ?? false,
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["products", query], data);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      return q.refetch();
    },
    createProduct: (input: ProductInput) => createMutation.mutateAsync(input),
    updateProduct: (id: string, patch: Partial<ProductInput>) => updateMutation.mutateAsync({ id, patch }),
    deleteProduct: (id: string) => deleteMutation.mutateAsync(id),
  };
}

export function useProductQuery(slugOrId?: string) {
  return useQuery<Product | null>({
    queryKey: ["product", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const bySlug = await productRepo.getBySlug(slugOrId).catch(() => null);
      if (bySlug) return bySlug;
      return productRepo.getById(slugOrId).catch(() => null);
    },
    enabled: Boolean(slugOrId),
  });
}

export function useProduct(slugOrId?: string) {
  const queryClient = useQueryClient();
  const q = useProductQuery(slugOrId);

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<ProductInput>) => {
      if (!q.data?.id) throw new Error("Product ID not loaded");
      return productRepo.update(q.data.id, patch);
    },
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    product: q.data ?? null,
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["product", slugOrId], data);
      await queryClient.invalidateQueries({ queryKey: ["product", slugOrId] });
      return q.refetch();
    },
    updateProduct: (patch: Partial<ProductInput>) => updateMutation.mutateAsync(patch),
  };
}

// ============================================================================
// 2. CATEGORIES HOOK
// ============================================================================
export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryRepo.list(),
  });
}

export function useCategories() {
  const queryClient = useQueryClient();
  const q = useCategoriesQuery();

  const createMutation = useMutation({
    mutationFn: (input: Omit<Category, "id">) => categoryRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Category> }) => categoryRepo.update(id, patch),
    onSuccess: () => revalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryRepo.remove(id),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    categories: q.data ?? [],
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["categories"], data);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      return q.refetch();
    },
    createCategory: (input: Omit<Category, "id">) => createMutation.mutateAsync(input),
    updateCategory: (id: string, patch: Partial<Category>) => updateMutation.mutateAsync({ id, patch }),
    deleteCategory: (id: string) => deleteMutation.mutateAsync(id),
  };
}

// ============================================================================
// 3. VOUCHERS HOOK
// ============================================================================
export function useVouchersQuery() {
  return useQuery<Voucher[]>({
    queryKey: ["vouchers"],
    queryFn: () => voucherRepo.list(),
  });
}

export function useVouchers() {
  const queryClient = useQueryClient();
  const q = useVouchersQuery();

  const createMutation = useMutation({
    mutationFn: (input: Omit<Voucher, "id" | "usedCount">) => voucherRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Voucher> }) => voucherRepo.update(id, patch),
    onSuccess: () => revalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => voucherRepo.remove(id),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    vouchers: q.data ?? [],
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["vouchers"], data);
      await queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      return q.refetch();
    },
    createVoucher: (input: Omit<Voucher, "id" | "usedCount">) => createMutation.mutateAsync(input),
    updateVoucher: (id: string, patch: Partial<Voucher>) => updateMutation.mutateAsync({ id, patch }),
    deleteVoucher: (id: string) => deleteMutation.mutateAsync(id),
    checkVoucher: (code: string, subtotal: number, categories: string[] = []): Promise<VoucherCheck> =>
      voucherRepo.check(code, subtotal, categories),
  };
}

// ============================================================================
// 4. ORDERS HOOKS
// ============================================================================
export function useOrdersQuery(query: OrderQuery = {}) {
  return useQuery<Paged<Order>>({
    queryKey: ["orders", query],
    queryFn: () => orderRepo.list(query),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrders(query: OrderQuery = {}) {
  const queryClient = useQueryClient();
  const q = useOrdersQuery(query);

  const createMutation = useMutation({
    mutationFn: (input: OrderInput) => orderRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderRepo.updateStatus(id, status),
    onSuccess: () => revalidateAll(),
  });

  const reviewPaymentMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: "approved" | "rejected"; note: string }) =>
      orderRepo.reviewPayment(id, status, note),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    orders: q.data?.items ?? [],
    total: q.data?.total ?? 0,
    page: q.data?.page ?? 1,
    perPage: q.data?.perPage ?? 6,
    hasMore: q.data?.hasMore ?? false,
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["orders", query], data);
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      return q.refetch();
    },
    createOrder: (input: OrderInput) => createMutation.mutateAsync(input),
    updateOrderStatus: (id: string, status: string) => updateStatusMutation.mutateAsync({ id, status }),
    reviewPayment: (id: string, status: "approved" | "rejected", note = "") =>
      reviewPaymentMutation.mutateAsync({ id, status, note }),
  };
}

export function useOrderByNumber(number?: string) {
  const queryClient = useQueryClient();
  const q = useQuery<Order | null>({
    queryKey: ["order", number],
    queryFn: () => (number ? orderRepo.getByNumber(number) : null),
    enabled: Boolean(number),
  });

  return {
    ...q,
    order: q.data ?? null,
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["order", number], data);
      await queryClient.invalidateQueries({ queryKey: ["order", number] });
      return q.refetch();
    },
  };
}

// ============================================================================
// 5. CUSTOMERS HOOK
// ============================================================================
export function useCustomersQuery() {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => customerRepo.list(),
  });
}

export function useCustomers() {
  const queryClient = useQueryClient();
  const q = useCustomersQuery();

  const createMutation = useMutation({
    mutationFn: (input: Omit<Customer, "id">) => customerRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerRepo.remove(id),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    customers: q.data ?? [],
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["customers"], data);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      return q.refetch();
    },
    createCustomer: (input: Omit<Customer, "id">) => createMutation.mutateAsync(input),
    deleteCustomer: (id: string) => deleteMutation.mutateAsync(id),
  };
}

// ============================================================================
// 6. SERVICES HOOK
// ============================================================================
export function useServicesQuery() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: () => serviceRepo.list(),
  });
}

export function useServices() {
  const queryClient = useQueryClient();
  const q = useServicesQuery();

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Service> }) => serviceRepo.update(id, patch),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    services: q.data ?? [],
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["services"], data);
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      return q.refetch();
    },
    updateService: (id: string, patch: Partial<Service>) => updateMutation.mutateAsync({ id, patch }),
  };
}

// ============================================================================
// 7. PORTFOLIO HOOKS
// ============================================================================
export function usePortfolioQuery() {
  return useQuery<PortfolioProject[]>({
    queryKey: ["portfolio"],
    queryFn: () => portfolioRepo.list(),
  });
}

export function usePortfolio() {
  const queryClient = useQueryClient();
  const q = usePortfolioQuery();

  const createMutation = useMutation({
    mutationFn: (input: Omit<PortfolioProject, "id">) => portfolioRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PortfolioProject> }) =>
      portfolioRepo.update(id, patch),
    onSuccess: () => revalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => portfolioRepo.remove(id),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    projects: q.data ?? [],
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["portfolio"], data);
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      return q.refetch();
    },
    createProject: (input: Omit<PortfolioProject, "id">) => createMutation.mutateAsync(input),
    updateProject: (id: string, patch: Partial<PortfolioProject>) => updateMutation.mutateAsync({ id, patch }),
    deleteProject: (id: string) => deleteMutation.mutateAsync(id),
  };
}

export function usePortfolioProject(slug?: string) {
  const queryClient = useQueryClient();
  const q = useQuery<PortfolioProject | null>({
    queryKey: ["portfolio", slug],
    queryFn: () => (slug ? portfolioRepo.getBySlug(slug) : null),
    enabled: Boolean(slug),
  });

  return {
    ...q,
    project: q.data ?? null,
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["portfolio", slug], data);
      await queryClient.invalidateQueries({ queryKey: ["portfolio", slug] });
      return q.refetch();
    },
  };
}

// ============================================================================
// 8. TESTIMONIALS HOOK
// ============================================================================
export function useTestimonialsQuery() {
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => testimonialRepo.list(),
  });
}

export function useTestimonials() {
  const queryClient = useQueryClient();
  const q = useTestimonialsQuery();

  const createMutation = useMutation({
    mutationFn: (input: Omit<Testimonial, "id">) => testimonialRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Testimonial> }) =>
      testimonialRepo.update(id, patch),
    onSuccess: () => revalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testimonialRepo.remove(id),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    testimonials: q.data ?? [],
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["testimonials"], data);
      await queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      return q.refetch();
    },
    createTestimonial: (input: Omit<Testimonial, "id">) => createMutation.mutateAsync(input),
    updateTestimonial: (id: string, patch: Partial<Testimonial>) => updateMutation.mutateAsync({ id, patch }),
    deleteTestimonial: (id: string) => deleteMutation.mutateAsync(id),
  };
}

// ============================================================================
// 9. PROMOTIONS HOOK
// ============================================================================
export function usePromotionsQuery() {
  return useQuery<Promotion[]>({
    queryKey: ["promotions"],
    queryFn: () => promotionRepo.list(),
  });
}

export function usePromotions() {
  const queryClient = useQueryClient();
  const q = usePromotionsQuery();

  const createMutation = useMutation({
    mutationFn: (input: Omit<Promotion, "id">) => promotionRepo.create(input),
    onSuccess: () => revalidateAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Promotion> }) =>
      promotionRepo.update(id, patch),
    onSuccess: () => revalidateAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionRepo.remove(id),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    promotions: q.data ?? [],
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["promotions"], data);
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      return q.refetch();
    },
    createPromotion: (input: Omit<Promotion, "id">) => createMutation.mutateAsync(input),
    updatePromotion: (id: string, patch: Partial<Promotion>) => updateMutation.mutateAsync({ id, patch }),
    deletePromotion: (id: string) => deleteMutation.mutateAsync(id),
  };
}

// ============================================================================
// 10. CONTENT & ENGAGEMENT HOOKS
// ============================================================================
export function useContentQuery() {
  return useQuery<SiteContent>({
    queryKey: ["content"],
    queryFn: () => contentRepo.get(),
  });
}

export function useContent() {
  const queryClient = useQueryClient();
  const q = useContentQuery();

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<SiteContent>) => contentRepo.update(patch),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    content: q.data,
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["content"], data);
      await queryClient.invalidateQueries({ queryKey: ["content"] });
      return q.refetch();
    },
    updateContent: (patch: Partial<SiteContent>) => updateMutation.mutateAsync(patch),
  };
}

export function useEngagementQuery() {
  return useQuery<EngagementContent>({
    queryKey: ["engagement"],
    queryFn: () => engagementRepo.get(),
  });
}

export function useEngagement() {
  const queryClient = useQueryClient();
  const q = useEngagementQuery();

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<EngagementContent>) => engagementRepo.update(patch),
    onSuccess: () => revalidateAll(),
  });

  return {
    ...q,
    engagement: q.data,
    mutate: async (data?: any, _revalidate?: boolean) => {
      if (data !== undefined) queryClient.setQueryData(["engagement"], data);
      await queryClient.invalidateQueries({ queryKey: ["engagement"] });
      return q.refetch();
    },
    updateEngagement: (patch: Partial<EngagementContent>) => updateMutation.mutateAsync(patch),
  };
}

// ============================================================================
// 12. MIDTRANS GATEWAY HOOKS
// ============================================================================
export function useMidtransStatusQuery() {
  return useQuery<MidtransStatus>({
    queryKey: ["midtrans", "status"],
    queryFn: () => midtransRepo.status(),
    staleTime: 1000 * 30, // 30 detik
  });
}

export function useMidtransStatus() {
  const queryClient = useQueryClient();
  const q = useMidtransStatusQuery();

  return {
    ...q,
    status: q.data,
    mutate: async () => {
      await queryClient.invalidateQueries({ queryKey: ["midtrans", "status"] });
      return q.refetch();
    },
  };
}
