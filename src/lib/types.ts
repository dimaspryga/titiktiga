export type Locale = "id" | "en";
export type LocalizedText = { id: string; en: string };
export type Role = "customer" | "admin";

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  order: number;
}

export interface ProductSpec {
  label: LocalizedText;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  discountPercent: number | null;
  images: string[];
  shortDescription: LocalizedText;
  description: LocalizedText;
  specs: ProductSpec[];
  stock: number;
  featured: boolean;
  rating?: number | null;
  status: "active" | "draft";
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt">;

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc" | "discount";

export interface ProductQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  discountOnly?: boolean;
  inStockOnly?: boolean;
  sort?: SortOption;
  page?: number;
  perPage?: number;
  includeDrafts?: boolean;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  startDate: string;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  eligibleCategories: string[] | null;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  productDiscount: number;
  voucherCode: string | null;
  voucherDiscount: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: "transfer" | "midtrans" | string;
  paymentStatus?: "waiting" | "submitted" | "approved" | "rejected";
  paymentNote?: string;
  paymentProof?: string | null;
  paymentReviewedAt?: string | null;
  createdAt: string;
}

export type OrderInput = Omit<Order, "id">;

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Service {
  id: string;
  slug: string;
  index: string;
  title: LocalizedText;
  description: LocalizedText;
  deliverables: LocalizedText[];
  priceFrom: number;
  image: string;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: LocalizedText;
  year: number;
  cover: string;
  images: string[];
  description: LocalizedText;
  services: string[];
}

export interface Testimonial {
  id: string;
  quote: LocalizedText;
  name: string;
  role: LocalizedText;
  avatar: string;
}

export interface Promotion {
  id: string;
  placement: "announcement" | "home-banner";
  title: LocalizedText;
  code: string | null;
  active: boolean;
}

export interface Stat {
  id: string;
  label: LocalizedText;
  value: number;
  suffix: string;
}

export interface SiteContent {
  hero: {
    eyebrow: LocalizedText;
    titleLines: LocalizedText[];
    subtitle: LocalizedText;
    image: string;
    imageAlt: LocalizedText;
  };
  marquee: LocalizedText[];
  aboutPreview: { eyebrow: LocalizedText; title: LocalizedText; body: LocalizedText; image: string };
  aboutPage: {
    story: LocalizedText[];
    vision: LocalizedText;
    mission: LocalizedText[];
    philosophy: LocalizedText;
    images: string[];
    videoUrl?: string;
    videoPoster?: string;
  };
  stats: Stat[];
  cta: { title: LocalizedText; subtitle: LocalizedText; button: LocalizedText };
  contact: {
    address: LocalizedText;
    email: string;
    phone: string;
    hours: LocalizedText;
  };
  featuredProductIds: string[];
  featuredCategorySlugs: string[];
  store: {
    name: string;
    tagline: LocalizedText;
    shippingFee: number;
    freeShippingThreshold: number;
  };
}

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: Role;
  loggedInAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  discountPercent: number | null;
  stock: number;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  productDiscount: number;
  voucherDiscount: number;
  shippingFee: number;
  total: number;
  freeShipping: boolean;
}

export interface PricingPeriod {
  id: string;
  label: LocalizedText;
  months: number;
  discountPercent: number;
}

export interface PricingTier {
  id: string;
  name: string;
  tagline: LocalizedText;
  monthlyPrice: number;
  parallelProjects: number;
  brands: LocalizedText;
  features: LocalizedText[];
  highlighted: boolean;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export interface Step {
  id: string;
  index: string;
  title: LocalizedText;
  description: LocalizedText;
  image?: string;
}

export interface PainPoint {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface Facility {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface Benefit {
  id: string;
  label: LocalizedText;
}

export interface DeliverableGroup {
  id: string;
  label: LocalizedText;
  items: LocalizedText[];
}

export interface EngagementContent {
  trustedClients: string[];
  painPoints: PainPoint[];
  steps: Step[];
  deliverableGroups: DeliverableGroup[];
  facilities: Facility[];
  benefits: Benefit[];
  faq: FaqItem[];
  pricing: {
    periods: PricingPeriod[];
    tiers: PricingTier[];
    allInclude: LocalizedText[];
    customTitle: LocalizedText;
    customBody: LocalizedText;
  };
}
