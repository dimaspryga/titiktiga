"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { productRepo } from "@/lib/repositories";
import { revalidateAll } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { ProductInput } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const { t } = useI18n();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { data: product, isLoading } = useSWR(params?.id ? ["product-id", params.id] : null, () => productRepo.getById(params!.id));

  const handle = async (values: ProductInput) => {
    setSubmitting(true);
    await productRepo.update(params!.id, values);
    revalidateAll();
    toast.success(t("admin.saved"));
    setSubmitting(false);
  };

  return (
    <div className="space-y-8" data-testid="admin-product-edit-page">
      <div>
        <Link href="/admin/products" className="link-underline inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground" data-testid="admin-product-edit-back">
          <ArrowLeft className="h-4 w-4" /> {t("admin.products")}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-medium md:text-4xl">{t("admin.products.edit")}</h1>
      </div>
      {isLoading && <div className="h-64 animate-pulse bg-muted/40" />}
      {!isLoading && !product && <p className="text-muted-foreground">—</p>}
      {product && <ProductForm key={product.id} initial={product} onSubmit={handle} submitting={submitting} />}
    </div>
  );
}
