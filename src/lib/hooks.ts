"use client";

import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
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
export async function revalidateAll(): Promise<void> {
  await invalidateAllQueries();
  void globalMutate(() => true, undefined, { revalidate: true });
}

// ============================================================================
// 1. PRODUCTS HOOKS
// ============================================================================
export function useProductsQuery(query: ProductQuery = {}) {
  return useQuery<Paged<Product>>({
    queryKey: ["products", query],
    queryFn: () => productRepo.list(query),
    placeholderData: (previousData: Paged<Product> | undefined) => previousData,
  });
}

export function useProducts(query: ProductQuery = {}) {
  const queryClient = useQueryClient();
  const q = useProductsQuery(query);

  const createMutation = useMutation<Product, Error, ProductInput>({
    mutationFn: (input: ProductInput) => productRepo.create(input),
    onSuccess: async (newProduct: Product) => {
      // Optimistic / Immediate Cache Update ke semua query produk aktif
      queryClient.setQueriesData<Paged<Product>>({ queryKey: ["products"] }, (old: Paged<Product> | undefined) => {
        if (!old) return old;
        const exists = old.items.some((p: Product) => p.id === newProduct.id);
        return {
          ...old,
          items: exists ? old.items.map((p: Product) => (p.id === newProduct.id ? newProduct : p)) : [newProduct, ...old.items],
          total: exists ? old.total : old.total + 1,
        };
      });
      queryClient.setQueryData<Product>(["product", newProduct.id], newProduct);
      queryClient.setQueryData<Product>(["product", newProduct.slug], newProduct);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await revalidateAll();
    },
  });

  const updateMutation = useMutation<
    Product,
    Error,
    { id: string; patch: Partial<ProductInput> },
    { previousProducts: [QueryKey, Paged<Product> | undefined][] }
  >({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ProductInput> }) => productRepo.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts = queryClient.getQueriesData<Paged<Product>>({ queryKey: ["products"] });
      queryClient.setQueriesData<Paged<Product>>({ queryKey: ["products"] }, (old: Paged<Product> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p: Product) => (p.id === id ? { ...p, ...patch } : p)),
        };
      });
      return { previousProducts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProducts) {
        for (const [key, data] of context.previousProducts) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: async (_data, _error, variables) => {
      if (variables?.id) {
        await queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      }
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await revalidateAll();
    },
  });

  const deleteMutation = useMutation<
    boolean,
    Error,
    string,
    { previousProducts: [QueryKey, Paged<Product> | undefined][] }
  >({
    mutationFn: (id: string) => productRepo.remove(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts = queryClient.getQueriesData<Paged<Product>>({ queryKey: ["products"] });
      queryClient.setQueriesData<Paged<Product>>({ queryKey: ["products"] }, (old: Paged<Product> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((p: Product) => p.id !== deletedId),
          total: Math.max(0, old.total - 1),
        };
      });
      return { previousProducts };
    },
    onError: (_err, _id, context) => {
      if (context?.previousProducts) {
        for (const [key, data] of context.previousProducts) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await revalidateAll();
    },
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

  const updateMutation = useMutation<Product, Error, Partial<ProductInput>, { prev?: Product | null }>({
    mutationFn: (patch: Partial<ProductInput>) => {
      if (!q.data?.id) throw new Error("Product ID not loaded");
      return productRepo.update(q.data.id, patch);
    },
    onMutate: async (patch: Partial<ProductInput>) => {
      if (slugOrId) {
        await queryClient.cancelQueries({ queryKey: ["product", slugOrId] });
        const prev = queryClient.getQueryData<Product>(["product", slugOrId]);
        if (prev) {
          queryClient.setQueryData<Product>(["product", slugOrId], { ...prev, ...patch });
        }
        return { prev };
      }
      return {};
    },
    onError: (_err, _vars, context) => {
      if (slugOrId && context?.prev) {
        queryClient.setQueryData(["product", slugOrId], context.prev);
      }
    },
    onSettled: async () => {
      if (slugOrId) {
        await queryClient.invalidateQueries({ queryKey: ["product", slugOrId] });
      }
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await revalidateAll();
    },
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

  const createMutation = useMutation<Category, Error, Omit<Category, "id">>({
    mutationFn: (input: Omit<Category, "id">) => categoryRepo.create(input),
    onSuccess: async (newCat: Category) => {
      // Optimistic cache append
      queryClient.setQueryData<Category[]>(["categories"], (old: Category[] = []) => {
        const exists = old.some((c: Category) => c.id === newCat.id);
        return exists ? old.map((c: Category) => (c.id === newCat.id ? newCat : c)) : [...old, newCat];
      });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await revalidateAll();
    },
  });

  const updateMutation = useMutation<
    Category,
    Error,
    { id: string; patch: Partial<Category> },
    { prev?: Category[] }
  >({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Category> }) => categoryRepo.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const prev = queryClient.getQueryData<Category[]>(["categories"]);
      queryClient.setQueryData<Category[]>(["categories"], (old: Category[] = []) =>
        old.map((c: Category) => (c.id === id ? { ...c, ...patch } : c))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["categories"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await revalidateAll();
    },
  });

  const deleteMutation = useMutation<boolean, Error, string, { prev?: Category[] }>({
    mutationFn: (id: string) => categoryRepo.remove(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const prev = queryClient.getQueryData<Category[]>(["categories"]);
      queryClient.setQueryData<Category[]>(["categories"], (old: Category[] = []) =>
        old.filter((c: Category) => c.id !== deletedId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["categories"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await revalidateAll();
    },
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

  const createMutation = useMutation<Voucher, Error, Omit<Voucher, "id" | "usedCount">>({
    mutationFn: (input: Omit<Voucher, "id" | "usedCount">) => voucherRepo.create(input),
    onSuccess: async (newVoucher: Voucher) => {
      queryClient.setQueryData<Voucher[]>(["vouchers"], (old: Voucher[] = []) => {
        const exists = old.some((v: Voucher) => v.id === newVoucher.id);
        return exists ? old.map((v: Voucher) => (v.id === newVoucher.id ? newVoucher : v)) : [newVoucher, ...old];
      });
      await queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      await revalidateAll();
    },
  });

  const updateMutation = useMutation<
    Voucher,
    Error,
    { id: string; patch: Partial<Voucher> },
    { prev?: Voucher[] }
  >({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Voucher> }) => voucherRepo.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["vouchers"] });
      const prev = queryClient.getQueryData<Voucher[]>(["vouchers"]);
      queryClient.setQueryData<Voucher[]>(["vouchers"], (old: Voucher[] = []) =>
        old.map((v: Voucher) => (v.id === id ? { ...v, ...patch } : v))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["vouchers"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      await revalidateAll();
    },
  });

  const deleteMutation = useMutation<boolean, Error, string, { prev?: Voucher[] }>({
    mutationFn: (id: string) => voucherRepo.remove(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["vouchers"] });
      const prev = queryClient.getQueryData<Voucher[]>(["vouchers"]);
      queryClient.setQueryData<Voucher[]>(["vouchers"], (old: Voucher[] = []) =>
        old.filter((v: Voucher) => v.id !== deletedId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["vouchers"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      await revalidateAll();
    },
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
    placeholderData: (previousData: Paged<Order> | undefined) => previousData,
  });
}

export function useOrders(query: OrderQuery = {}) {
  const queryClient = useQueryClient();
  const q = useOrdersQuery(query);

  const createMutation = useMutation<Order, Error, OrderInput>({
    mutationFn: (input: OrderInput) => orderRepo.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await revalidateAll();
    },
  });

  const updateStatusMutation = useMutation<
    Order,
    Error,
    { id: string; status: string },
    { prevOrders: [QueryKey, Paged<Order> | undefined][] }
  >({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderRepo.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const prevOrders = queryClient.getQueriesData<Paged<Order>>({ queryKey: ["orders"] });
      queryClient.setQueriesData<Paged<Order>>({ queryKey: ["orders"] }, (old: Paged<Order> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((o: Order) => (o.id === id ? { ...o, status: status as any } : o)),
        };
      });
      return { prevOrders };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevOrders) {
        for (const [key, data] of ctx.prevOrders) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await revalidateAll();
    },
  });

  const reviewPaymentMutation = useMutation<
    Order,
    Error,
    { id: string; status: "approved" | "rejected"; note: string },
    { prevOrders: [QueryKey, Paged<Order> | undefined][] }
  >({
    mutationFn: ({ id, status, note }: { id: string; status: "approved" | "rejected"; note: string }) =>
      orderRepo.reviewPayment(id, status, note),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const prevOrders = queryClient.getQueriesData<Paged<Order>>({ queryKey: ["orders"] });
      queryClient.setQueriesData<Paged<Order>>({ queryKey: ["orders"] }, (old: Paged<Order> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((o: Order) =>
            o.id === id
              ? {
                  ...o,
                  paymentStatus: status,
                  status: status === "approved" ? "processing" : o.status,
                }
              : o
          ),
        };
      });
      return { prevOrders };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevOrders) {
        for (const [key, data] of ctx.prevOrders) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await revalidateAll();
    },
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

  const createMutation = useMutation<Customer, Error, Omit<Customer, "id">>({
    mutationFn: (input: Omit<Customer, "id">) => customerRepo.create(input),
    onSuccess: async (newCustomer: Customer) => {
      queryClient.setQueryData<Customer[]>(["customers"], (old: Customer[] = []) => {
        const exists = old.some((c: Customer) => c.id === newCustomer.id);
        return exists ? old.map((c: Customer) => (c.id === newCustomer.id ? newCustomer : c)) : [newCustomer, ...old];
      });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await revalidateAll();
    },
  });

  const deleteMutation = useMutation<boolean, Error, string, { prev?: Customer[] }>({
    mutationFn: (id: string) => customerRepo.remove(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["customers"] });
      const prev = queryClient.getQueryData<Customer[]>(["customers"]);
      queryClient.setQueryData<Customer[]>(["customers"], (old: Customer[] = []) =>
        old.filter((c: Customer) => c.id !== deletedId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["customers"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await revalidateAll();
    },
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

  const updateMutation = useMutation<
    Service,
    Error,
    { id: string; patch: Partial<Service> },
    { prev?: Service[] }
  >({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Service> }) => serviceRepo.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });
      const prev = queryClient.getQueryData<Service[]>(["services"]);
      queryClient.setQueryData<Service[]>(["services"], (old: Service[] = []) =>
        old.map((s: Service) => (s.id === id ? { ...s, ...patch } : s))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["services"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      await revalidateAll();
    },
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

  const createMutation = useMutation<PortfolioProject, Error, Omit<PortfolioProject, "id">>({
    mutationFn: (input: Omit<PortfolioProject, "id">) => portfolioRepo.create(input),
    onSuccess: async (newProj: PortfolioProject) => {
      queryClient.setQueryData<PortfolioProject[]>(["portfolio"], (old: PortfolioProject[] = []) => {
        const exists = old.some((p: PortfolioProject) => p.id === newProj.id);
        return exists ? old.map((p: PortfolioProject) => (p.id === newProj.id ? newProj : p)) : [newProj, ...old];
      });
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      await revalidateAll();
    },
  });

  const updateMutation = useMutation<
    PortfolioProject,
    Error,
    { id: string; patch: Partial<PortfolioProject> },
    { prev?: PortfolioProject[] }
  >({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PortfolioProject> }) =>
      portfolioRepo.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio"] });
      const prev = queryClient.getQueryData<PortfolioProject[]>(["portfolio"]);
      queryClient.setQueryData<PortfolioProject[]>(["portfolio"], (old: PortfolioProject[] = []) =>
        old.map((p: PortfolioProject) => (p.id === id ? { ...p, ...patch } : p))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["portfolio"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      await revalidateAll();
    },
  });

  const deleteMutation = useMutation<boolean, Error, string, { prev?: PortfolioProject[] }>({
    mutationFn: (id: string) => portfolioRepo.remove(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio"] });
      const prev = queryClient.getQueryData<PortfolioProject[]>(["portfolio"]);
      queryClient.setQueryData<PortfolioProject[]>(["portfolio"], (old: PortfolioProject[] = []) =>
        old.filter((p: PortfolioProject) => p.id !== deletedId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["portfolio"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      await revalidateAll();
    },
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

  const createMutation = useMutation<Testimonial, Error, Omit<Testimonial, "id">>({
    mutationFn: (input: Omit<Testimonial, "id">) => testimonialRepo.create(input),
    onSuccess: async (newTestimonial: Testimonial) => {
      queryClient.setQueryData<Testimonial[]>(["testimonials"], (old: Testimonial[] = []) => {
        const exists = old.some((t: Testimonial) => t.id === newTestimonial.id);
        return exists ? old.map((t: Testimonial) => (t.id === newTestimonial.id ? newTestimonial : t)) : [newTestimonial, ...old];
      });
      await queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      await revalidateAll();
    },
  });

  const updateMutation = useMutation<
    Testimonial,
    Error,
    { id: string; patch: Partial<Testimonial> },
    { prev?: Testimonial[] }
  >({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Testimonial> }) =>
      testimonialRepo.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      const prev = queryClient.getQueryData<Testimonial[]>(["testimonials"]);
      queryClient.setQueryData<Testimonial[]>(["testimonials"], (old: Testimonial[] = []) =>
        old.map((t: Testimonial) => (t.id === id ? { ...t, ...patch } : t))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["testimonials"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      await revalidateAll();
    },
  });

  const deleteMutation = useMutation<boolean, Error, string, { prev?: Testimonial[] }>({
    mutationFn: (id: string) => testimonialRepo.remove(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      const prev = queryClient.getQueryData<Testimonial[]>(["testimonials"]);
      queryClient.setQueryData<Testimonial[]>(["testimonials"], (old: Testimonial[] = []) =>
        old.filter((t: Testimonial) => t.id !== deletedId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["testimonials"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      await revalidateAll();
    },
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

  const createMutation = useMutation<Promotion, Error, Omit<Promotion, "id">>({
    mutationFn: (input: Omit<Promotion, "id">) => promotionRepo.create(input),
    onSuccess: async (newPromo: Promotion) => {
      queryClient.setQueryData<Promotion[]>(["promotions"], (old: Promotion[] = []) => {
        const exists = old.some((p: Promotion) => p.id === newPromo.id);
        return exists ? old.map((p: Promotion) => (p.id === newPromo.id ? newPromo : p)) : [newPromo, ...old];
      });
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await revalidateAll();
    },
  });

  const updateMutation = useMutation<
    Promotion,
    Error,
    { id: string; patch: Partial<Promotion> },
    { prev?: Promotion[] }
  >({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Promotion> }) =>
      promotionRepo.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["promotions"] });
      const prev = queryClient.getQueryData<Promotion[]>(["promotions"]);
      queryClient.setQueryData<Promotion[]>(["promotions"], (old: Promotion[] = []) =>
        old.map((p: Promotion) => (p.id === id ? { ...p, ...patch } : p))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["promotions"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await revalidateAll();
    },
  });

  const deleteMutation = useMutation<boolean, Error, string, { prev?: Promotion[] }>({
    mutationFn: (id: string) => promotionRepo.remove(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["promotions"] });
      const prev = queryClient.getQueryData<Promotion[]>(["promotions"]);
      queryClient.setQueryData<Promotion[]>(["promotions"], (old: Promotion[] = []) =>
        old.filter((p: Promotion) => p.id !== deletedId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["promotions"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      await revalidateAll();
    },
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

  const updateMutation = useMutation<SiteContent, Error, Partial<SiteContent>, { prev?: SiteContent }>({
    mutationFn: (patch: Partial<SiteContent>) => contentRepo.update(patch),
    onMutate: async (patch: Partial<SiteContent>) => {
      await queryClient.cancelQueries({ queryKey: ["content"] });
      const prev = queryClient.getQueryData<SiteContent>(["content"]);
      if (prev) {
        queryClient.setQueryData<SiteContent>(["content"], { ...prev, ...patch });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["content"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["content"] });
      await revalidateAll();
    },
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

  const updateMutation = useMutation<
    EngagementContent,
    Error,
    Partial<EngagementContent>,
    { prev?: EngagementContent }
  >({
    mutationFn: (patch: Partial<EngagementContent>) => engagementRepo.update(patch),
    onMutate: async (patch: Partial<EngagementContent>) => {
      await queryClient.cancelQueries({ queryKey: ["engagement"] });
      const prev = queryClient.getQueryData<EngagementContent>(["engagement"]);
      if (prev) {
        queryClient.setQueryData<EngagementContent>(["engagement"], { ...prev, ...patch });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["engagement"], ctx.prev);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["engagement"] });
      await revalidateAll();
    },
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
