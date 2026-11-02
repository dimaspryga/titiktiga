// Repository layer — REST API backed by MySQL.
export {
  productRepo,
  categoryRepo,
  voucherRepo,
  orderRepo,
  customerRepo,
  serviceRepo,
  portfolioRepo,
  testimonialRepo,
  promotionRepo,
  contentRepo,
  type VoucherError,
  type VoucherCheck,
  type OrderQuery,
} from "@/lib/repositories/mysql";
