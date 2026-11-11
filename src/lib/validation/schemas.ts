import { z } from "zod";

const required = "Wajib diisi";
const emailMsg = "Format email tidak valid";

export const loginSchema = z.object({
  email: z.string().min(1, required).email(emailMsg),
  password: z.string().min(1, required),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().min(1, required).email(emailMsg),
    password: z
      .string()
      .min(8, "Minimal 8 karakter")
      .regex(/[a-zA-Z]/, "Harus mengandung huruf")
      .regex(/[0-9]/, "Harus mengandung angka"),
    confirmPassword: z.string().min(1, required),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({
  email: z.string().min(1, required).email(emailMsg),
  newPassword: z
    .string()
    .min(8, "Minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Harus mengandung huruf")
    .regex(/[0-9]/, "Harus mengandung angka"),
});
export type ForgotValues = z.infer<typeof forgotSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().min(1, required).email(emailMsg),
  phone: z
    .string()
    .min(8, "Nomor minimal 8 digit")
    .regex(/^[0-9+\-\s()]+$/, "Nomor tidak valid")
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const checkoutSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().min(1, required).email(emailMsg),
  phone: z.string().min(8, "Nomor minimal 8 digit").regex(/^[0-9+\-\s()]+$/, "Nomor tidak valid"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  notes: z.string().max(500, "Maksimal 500 karakter").optional().or(z.literal("")),
});
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug: huruf kecil, angka, tanda hubung"),
  category: z.string().min(1, "Pilih kategori"),
  price: z.coerce.number().int("Harus bilangan bulat").min(1000, "Minimal Rp 1.000"),
  discountPercent: z.coerce.number().min(0).max(90, "Maksimal 90%").nullable().optional(),
  rating: z.coerce.number().min(0).max(5).nullable().optional(),
  stock: z.coerce.number().int().min(0, "Stok tidak valid"),
  detailCover: z.string().optional().nullable(),
  images: z.array(z.string().min(4)).min(1, "Minimal 1 gambar"),
  shortDescription: z.object({
    id: z.string().min(5, "Minimal 5 karakter"),
    en: z.string().min(5, "Minimal 5 karakter"),
  }),
  description: z.object({
    id: z.string().min(10, "Minimal 10 karakter"),
    en: z.string().min(10, "Minimal 10 karakter"),
  }),
  specs: z.array(z.object({ label: z.object({ id: z.string(), en: z.string() }), value: z.string() })),
  featured: z.boolean(),
  status: z.enum(["active", "draft"]),
});
export type ProductFormValues = z.input<typeof productSchema>;

export const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Minimal 3 karakter")
      .regex(/^[A-Z0-9]+$/, "Huruf kapital & angka saja"),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().min(1, "Minimal 1"),
    minPurchase: z.coerce.number().min(0),
    maxDiscount: z.coerce.number().min(0).nullable().optional(),
    startDate: z.string().min(1, required),
    expiryDate: z.string().min(1, required),
    usageLimit: z.coerce.number().int().min(1).nullable().optional(),
    active: z.boolean(),
    eligibleCategories: z.array(z.string()).nullable().optional(),
  })
  .refine((v) => v.type !== "percentage" || v.value <= 100, {
    message: "Persentase maksimal 100",
    path: ["value"],
  })
  .refine((v) => new Date(v.startDate) <= new Date(v.expiryDate), {
    message: "Tanggal mulai harus sebelum kedaluwarsa",
    path: ["expiryDate"],
  });
export type VoucherFormValues = z.input<typeof voucherSchema>;

export const categorySchema = z.object({
  name: z.object({ id: z.string().min(2, "Minimal 2 karakter"), en: z.string().min(2, "Minimal 2 karakter") }),
  slug: z.string().regex(/^[a-z0-9-]*$/, "Slug: huruf kecil, angka, tanda hubung"),
  description: z.object({ id: z.string().min(5, "Minimal 5 karakter"), en: z.string().min(5, "Minimal 5 karakter") }),
  order: z.coerce.number().int().min(0),
});
export type CategoryFormValues = z.input<typeof categorySchema>;

export const promotionSchema = z.object({
  placement: z.enum(["announcement", "home-banner"]),
  title: z.object({ id: z.string().min(3, "Minimal 3 karakter"), en: z.string().min(3, "Minimal 3 karakter") }),
  code: z.string().max(20).optional().or(z.literal("")),
  active: z.boolean(),
});
export type PromotionFormValues = z.input<typeof promotionSchema>;

export const testimonialSchema = z.object({
  quote: z.object({ id: z.string().min(10, "Minimal 10 karakter"), en: z.string().min(10, "Minimal 10 karakter") }),
  name: z.string().min(2, "Minimal 2 karakter"),
  role: z.object({ id: z.string().min(2, "Minimal 2 karakter"), en: z.string().min(2, "Minimal 2 karakter") }),
  avatar: z.string().min(4, "URL avatar wajib diisi"),
});
export type TestimonialFormValues = z.input<typeof testimonialSchema>;

export const orderStatusSchema = z.enum(["pending", "processing", "shipped", "completed", "cancelled"]);
export type OrderStatusValue = z.infer<typeof orderStatusSchema>;
