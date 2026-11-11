import type { MetadataRoute } from "next";
import { seedProductsRated } from "@/lib/mock/catalog";
import { seedPortfolio } from "@/lib/mock/site";

export const dynamic = "force-static";

const staticPaths = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/products", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/portfolio", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
];

/** Sitemap: halaman statis + semua produk & proyek portofolio (data seed demo). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return [
    ...staticPaths.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    ...seedProductsRated.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...seedPortfolio.map((pf) => ({
      url: `${base}/portfolio/${pf.slug}`,
      lastModified: new Date(`${pf.year}-01-01`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
