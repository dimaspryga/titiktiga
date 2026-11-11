"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { productSchema, type ProductFormValues } from "@/lib/validation/schemas";
import type { Product, ProductInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function ProductForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Product | null;
  onSubmit: (values: ProductInput) => void;
  submitting: boolean;
}) {
  const { t, tt } = useI18n();
  const { data: categories } = useCategories();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          slug: initial.slug,
          category: initial.category,
          price: initial.price,
          discountPercent: initial.discountPercent,
          stock: initial.stock,
          images: initial.images,
          shortDescription: initial.shortDescription,
          description: initial.description,
          specs: initial.specs.length > 0 ? initial.specs : [],
          rating: initial.rating ?? null,
          featured: initial.featured,
          status: initial.status,
        }
      : {
          name: "",
          slug: "",
          category: "",
          price: undefined as unknown as number,
          discountPercent: null,
          stock: 10,
          images: [],
          shortDescription: { id: "", en: "" },
          description: { id: "", en: "" },
          specs: [],
          rating: null,
          featured: false,
          status: "active",
        },
  });

  const specs = useFieldArray({ control: form.control, name: "specs" });

  useEffect(() => {
    if (!initial) {
      const name = form.getValues("name");
      if (name && !form.getValues("slug")) form.setValue("slug", slugify(name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("name")]);

  const submit = (values: ProductFormValues) => {
    const input: ProductInput = {
      name: values.name,
      slug: values.slug,
      category: values.category,
      price: Number(values.price),
      discountPercent: values.discountPercent ?? null,
      stock: Number(values.stock),
      images: values.images,
      shortDescription: values.shortDescription,
      description: values.description,
      specs: (values.specs ?? []).filter((s) => s.label.id && s.label.en && s.value),
      rating: values.rating == null || Number(values.rating) <= 0 ? null : Number(values.rating),
      featured: values.featured,
      status: values.status,
    };
    onSubmit(input);
  };

  const err = (msg?: string) => (msg ? <p className="text-xs text-destructive">{msg}</p> : null);

  return (
    <form
      onSubmit={form.handleSubmit(submit, () => {
        toast.error("Produk belum lengkap", {
          description: "Periksa kembali bidang yang ditandai sebelum menyimpan.",
        });
      })}
      className="space-y-10"
      data-testid="admin-product-form"
      noValidate
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pf-name">{t("admin.table.product")}</Label>
            <Input id="pf-name" data-testid="admin-product-name" {...form.register("name")} className="h-11 rounded-none" />
            {err(form.formState.errors.name?.message)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-slug">Slug</Label>
            <Input id="pf-slug" data-testid="admin-product-slug" {...form.register("slug")} className="h-11 rounded-none font-mono text-sm" />
            {err(form.formState.errors.slug?.message)}
          </div>
          <div className="space-y-2">
            <Label>{t("admin.table.category")}</Label>
            <Select value={form.watch("category") || undefined} onValueChange={(v) => form.setValue("category", v)}>
              <SelectTrigger className="h-11 w-full rounded-none" data-testid="admin-product-category">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {tt(c.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err(form.formState.errors.category?.message)}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="pf-price">{t("admin.table.price")} (Rp)</Label>
              <Input id="pf-price" type="number" data-testid="admin-product-price" {...form.register("price")} className="h-11 rounded-none" />
              {err(form.formState.errors.price?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-discount">{t("admin.table.discount")} %</Label>
              <Input id="pf-discount" type="number" placeholder="—" data-testid="admin-product-discount" {...form.register("discountPercent")} className="h-11 rounded-none" />
              {err(form.formState.errors.discountPercent?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-stock">{t("admin.table.stock")}</Label>
              <Input id="pf-stock" type="number" data-testid="admin-product-stock" {...form.register("stock")} className="h-11 rounded-none" />
              {err(form.formState.errors.stock?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-rating">{t("product.rating")} (0–5)</Label>
              <Input
                id="pf-rating"
                type="number"
                step="0.1"
                min={0}
                max={5}
                placeholder="—"
                data-testid="admin-product-rating"
                {...form.register("rating")}
                className="h-11 rounded-none"
              />
              {err(form.formState.errors.rating?.message)}
            </div>
          </div>

          <div className="space-y-4">
            <Label>{t("admin.table.product")} — ID / EN</Label>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="pf-short-id" className="font-mono text-[10px] uppercase">Ringkas (ID)</Label>
                <Textarea id="pf-short-id" rows={2} data-testid="admin-product-short-id" {...form.register("shortDescription.id")} className="rounded-none" />
                {err(form.formState.errors.shortDescription?.id?.message)}
              </div>
              <div className="space-y-1">
                <Label htmlFor="pf-short-en" className="font-mono text-[10px] uppercase">Short (EN)</Label>
                <Textarea id="pf-short-en" rows={2} data-testid="admin-product-short-en" {...form.register("shortDescription.en")} className="rounded-none" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pf-desc-id" className="font-mono text-[10px] uppercase">Deskripsi (ID)</Label>
                <Textarea id="pf-desc-id" rows={5} data-testid="admin-product-desc-id" {...form.register("description.id")} className="rounded-none" />
                {err(form.formState.errors.description?.id?.message)}
              </div>
              <div className="space-y-1">
                <Label htmlFor="pf-desc-en" className="font-mono text-[10px] uppercase">Description (EN)</Label>
                <Textarea id="pf-desc-en" rows={5} data-testid="admin-product-desc-en" {...form.register("description.en")} className="rounded-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <Label>Gambar</Label>
            <ImageUpload value={form.watch("images") ?? []} onChange={(images) => form.setValue("images", images, { shouldValidate: true })} />
            {err(form.formState.errors.images?.message as string)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Spesifikasi</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none"
                data-testid="admin-product-spec-add"
                onClick={() => specs.append({ label: { id: "", en: "" }, value: "" })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Spec
              </Button>
            </div>
            {specs.fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2" data-testid={`admin-product-spec-row-${i}`}>
                <Input placeholder="Label ID" data-testid={`admin-product-spec-label-id-${i}`} {...form.register(`specs.${i}.label.id`)} className="h-10 rounded-none text-sm" />
                <Input placeholder="Label EN" {...form.register(`specs.${i}.label.en`)} className="h-10 rounded-none text-sm" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Hapus spec"
                  data-testid={`admin-product-spec-remove-${i}`}
                  onClick={() => specs.remove(i)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Input placeholder="Nilai / value" {...form.register(`specs.${i}.value`)} className="col-span-3 h-10 rounded-none text-sm" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border border-border bg-card px-4 py-3">
            <Label htmlFor="pf-featured">{t("admin.table.featured")}</Label>
            <Switch id="pf-featured" checked={form.watch("featured")} onCheckedChange={(v) => form.setValue("featured", v)} data-testid="admin-product-featured" />
          </div>

          <div className="space-y-2">
            <Label>{t("admin.table.status")}</Label>
            <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as "active" | "draft")}>
              <SelectTrigger className="h-11 w-full rounded-none" data-testid="admin-product-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={submitting} className="h-12 rounded-none bg-lime px-10 font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-product-save">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Simpan
        </Button>
      </div>
    </form>
  );
}

export function useProductFormRouter() {
  return useRouter();
}
