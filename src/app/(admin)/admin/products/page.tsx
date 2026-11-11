"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Star } from "lucide-react";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { productRepo } from "@/lib/repositories";
import { useProducts, revalidateAll } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";
import { unitPrice } from "@/lib/services/pricing";

export default function AdminProductsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data, items, isLoading, deleteProduct } = useProducts({ includeDrafts: true, q: search || undefined, perPage: 100 });

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    toast.success(t("admin.deleted"));
  };

  return (
    <div className="space-y-8" data-testid="admin-products-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.products.title")}</h1>
        <Button asChild className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-new-product-button">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> {t("admin.products.new")}
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.search.placeholder")}
          data-testid="admin-products-search"
          className="h-11 rounded-none pl-10"
        />
      </div>

      <div className="overflow-x-auto border border-border bg-card" data-testid="admin-products-table">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3">{t("admin.table.product")}</th>
              <th className="px-4 py-3">{t("admin.table.category")}</th>
              <th className="px-4 py-3">{t("admin.table.price")}</th>
              <th className="px-4 py-3">{t("admin.table.stock")}</th>
              <th className="px-4 py-3">{t("admin.table.status")}</th>
              <th className="px-4 py-3 text-right">{t("admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td colSpan={6} className="px-4 py-3">
                    <Skeleton className="h-10 w-full" />
                  </td>
                </tr>
              ))}
            {(data?.items ?? []).map((product) => (
              <tr key={product.id} className="border-b border-border/60 transition-colors hover:bg-accent/50" data-testid={`admin-product-row-${product.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.images[0]} alt="" className="h-10 w-10 shrink-0 object-cover" />
                    <span className="font-medium">
                      {product.name}
                      {product.featured && <Star className="ml-2 inline h-3.5 w-3.5 fill-lime text-lime" aria-label={t("admin.table.featured")} />}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{product.category}</td>
                <td className="px-4 py-3">
                  {formatIDR(unitPrice(product.price, product.discountPercent))}
                  {product.discountPercent ? <span className="ml-2 font-mono text-[10px] text-muted-foreground">−{product.discountPercent}%</span> : null}
                </td>
                <td className="px-4 py-3 font-mono">{product.stock}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${product.status === "active" ? "bg-lime text-lime-foreground" : "bg-muted"}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-none" data-testid={`admin-product-edit-${product.id}`}>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <ConfirmDelete onConfirm={() => handleDelete(product.id)} testId={`admin-product-delete-${product.id}`}>
                      <Button variant="outline" size="sm" className="rounded-none text-destructive" data-testid={`admin-product-delete-button-${product.id}`}>
                        Hapus
                      </Button>
                    </ConfirmDelete>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
