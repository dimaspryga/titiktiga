import apiClient from "@/lib/api/axios";
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

async function api<T>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", data?: unknown): Promise<T> {
  const response = await apiClient.request<T>({
    url: path,
    method,
    data,
  });
  return response.data;
}

export type VoucherError = "invalid" | "inactive" | "expired" | "limit" | "min-purchase" | "category";
export type VoucherCheck = { ok: true; voucher: Voucher } | { ok: false; error: VoucherError };
export type OrderQuery = { q?: string; email?: string; status?: string; page?: number; perPage?: number };

export const productRepo = {
  list: (query: ProductQuery = {}) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]) as [string, string][]
    ).toString();
    return api<Paged<Product>>(`/products${params ? `?${params}` : ""}`);
  },
  getBySlug: (slug: string) => api<Product | null>(`/products/${encodeURIComponent(slug)}?by=slug`),
  getById: (id: string) => api<Product | null>(`/products/${encodeURIComponent(id)}`),
  create: (input: ProductInput) => api<Product>("/products", "POST", input),
  update: (id: string, patch: Partial<ProductInput>) => api<Product>(`/products/${id}`, "PATCH", patch),
  remove: (id: string) => api<boolean>(`/products/${id}`, "DELETE"),
};

export const categoryRepo = {
  list: () => api<Category[]>("/categories"),
  create: (input: Omit<Category, "id">) => api<Category>("/categories", "POST", input),
  update: (id: string, patch: Partial<Category>) => api<Category>(`/categories/${id}`, "PATCH", patch),
  remove: (id: string) => api<boolean>(`/categories/${id}`, "DELETE"),
};

export const voucherRepo = {
  list: () => api<Voucher[]>("/vouchers"),
  create: (input: Omit<Voucher, "id" | "usedCount">) => api<Voucher>("/vouchers", "POST", input),
  update: (id: string, patch: Partial<Voucher>) => api<Voucher>(`/vouchers/${id}`, "PATCH", patch),
  remove: (id: string) => api<boolean>(`/vouchers/${id}`, "DELETE"),
  check: (code: string, subtotal: number, categories: string[] = []) =>
    api<VoucherCheck>("/vouchers/check", "POST", { code, subtotal, categories }),
};

export const orderRepo = {
  list: (query: OrderQuery = {}) => {
    const params = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== "all")
        .map(([k, v]) => [k, String(v)]) as [string, string][]
    ).toString();
    return api<Paged<Order>>(`/orders${params ? `?${params}` : ""}`);
  },
  getByNumber: (number: string) => api<Order | null>(`/orders/by-number/${encodeURIComponent(number)}`),
  create: (input: OrderInput) => api<Order>("/orders", "POST", input),
  updateStatus: (id: string, status: string) => api<Order>(`/orders/${id}`, "PATCH", { status }),
  reviewPayment: (id: string, paymentStatus: "approved" | "rejected", note = "") =>
    api<Order>(`/orders/${id}`, "PATCH", { paymentStatus, paymentNote: note }),
};

export const customerRepo = {
  list: () => api<Customer[]>("/customers"),
  create: (input: Omit<Customer, "id">) => api<Customer>("/customers", "POST", input),
  remove: (id: string) => api<boolean>(`/customers/${id}`, "DELETE"),
};

export const serviceRepo = {
  list: () => api<Service[]>("/services"),
  update: (id: string, patch: Partial<Service>) => api<Service>(`/services/${id}`, "PATCH", patch),
};

export const portfolioRepo = {
  list: () => api<PortfolioProject[]>("/portfolio"),
  getBySlug: (slug: string) => api<PortfolioProject | null>(`/portfolio/${encodeURIComponent(slug)}?by=slug`),
  create: (input: Omit<PortfolioProject, "id">) => api<PortfolioProject>("/portfolio", "POST", input),
  update: (id: string, patch: Partial<PortfolioProject>) => api<PortfolioProject>(`/portfolio/${id}`, "PATCH", patch),
  remove: (id: string) => api<boolean>(`/portfolio/${id}`, "DELETE"),
};

export const testimonialRepo = {
  list: () => api<Testimonial[]>("/testimonials"),
  create: (input: Omit<Testimonial, "id">) => api<Testimonial>("/testimonials", "POST", input),
  update: (id: string, patch: Partial<Testimonial>) => api<Testimonial>(`/testimonials/${id}`, "PATCH", patch),
  remove: (id: string) => api<boolean>(`/testimonials/${id}`, "DELETE"),
};

export const promotionRepo = {
  list: () => api<Promotion[]>("/promotions"),
  create: (input: Omit<Promotion, "id">) => api<Promotion>("/promotions", "POST", input),
  update: (id: string, patch: Partial<Promotion>) => api<Promotion>(`/promotions/${id}`, "PATCH", patch),
  remove: (id: string) => api<boolean>(`/promotions/${id}`, "DELETE"),
};

export const contentRepo = {
  get: () => api<SiteContent>("/content"),
  update: (patch: Partial<SiteContent>) => api<SiteContent>("/content", "PATCH", patch),
};

export const engagementRepo = {
  get: () => api<EngagementContent>("/engagement"),
  update: (patch: Partial<EngagementContent>) => api<EngagementContent>("/engagement", "PATCH", patch),
};

export interface MidtransStatus {
  isConfigured: boolean;
  clientKeyConfigured: boolean;
  serverKeyConfigured: boolean;
  clientKey: string | null;
  isProduction: boolean;
  snapUrl: string;
  environment: "production" | "sandbox";
}

export interface MidtransTokenResult {
  isConfigured: boolean;
  token: string | null;
  redirectUrl: string | null;
  message?: string;
  error?: string;
  orderNumber?: string;
}

export const midtransRepo = {
  status: () => api<MidtransStatus>("/midtrans/status"),
  createToken: (data: {
    orderId?: string;
    orderNumber: string;
    grossAmount: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items?: any[];
  }) => api<MidtransTokenResult>("/midtrans/token", "POST", data),
};
