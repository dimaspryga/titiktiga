"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { useProducts } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { ProductInput } from "@/lib/types";

export default function NewProductPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { createProduct } = useProducts();

  const handle = async (values: ProductInput) => {
    setSubmitting(true);
    try {
      const product = await createProduct(values);
      toast.success("Produk berhasil ditambahkan", {
        description: product.name,
      });
      router.push(`/admin/products/${product.id}/edit`);
    } catch (error) {
      toast.error("Produk gagal ditambahkan", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan produk.",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="admin-product-new-page">
      <div>
        <Link href="/admin/products" className="link-underline inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground" data-testid="admin-product-new-back">
          <ArrowLeft className="h-4 w-4" /> {t("admin.products")}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium md:text-4xl">{t("admin.products.new")}</h1>
      </div>
      <ProductForm onSubmit={handle} submitting={submitting} />
    </div>
  );
}
