"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryRepo } from "@/lib/repositories";
import { revalidateAll, useCategories } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { categorySchema, type CategoryFormValues } from "@/lib/validation/schemas";

export default function AdminCategoriesPage() {
  const { t, tt } = useI18n();
  const { data: categories } = useCategories();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: { id: "", en: "" }, slug: "", description: { id: "", en: "" }, order: 0 },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: { id: "", en: "" }, slug: "", description: { id: "", en: "" }, order: 0 });
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const cat = categories?.find((c) => c.id === id);
    if (!cat) return;
    setEditing(id);
    form.reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      order: cat.order,
    });
    setOpen(true);
  };

  const submit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      order: Number(values.order),
    };
    if (editing) await categoryRepo.update(editing, payload);
    else await categoryRepo.create({ ...payload, image: "https://images.unsplash.com/photo-1620275765334-4ed948bb4502?q=80&w=1200&auto=format&fit=crop" });
    revalidateAll();
    toast.success(t("admin.saved"));
    setSubmitting(false);
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await categoryRepo.remove(id);
    revalidateAll();
    toast.success(t("admin.deleted"));
  };

  return (
    <div className="space-y-8" data-testid="admin-categories-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.categories")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-category-new" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> {t("admin.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Ubah Kategori" : "Kategori Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4" data-testid="admin-category-form" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name-id">Nama (ID)</Label>
                  <Input id="cat-name-id" data-testid="admin-category-name-id" {...form.register("name.id")} className="h-10 rounded-none" />
                  {form.formState.errors.name?.id && <p className="text-xs text-destructive">{form.formState.errors.name.id.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name-en">Name (EN)</Label>
                  <Input id="cat-name-en" {...form.register("name.en")} className="h-10 rounded-none" />
                </div>
              </div>
              <div className="grid grid-cols-[2fr_1fr] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-slug">Slug</Label>
                  <Input id="cat-slug" data-testid="admin-category-slug" {...form.register("slug")} className="h-10 rounded-none font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-order">{t("admin.table.order")}</Label>
                  <Input id="cat-order" type="number" {...form.register("order")} className="h-10 rounded-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-desc-id">Deskripsi (ID)</Label>
                  <Input id="cat-desc-id" {...form.register("description.id")} className="h-10 rounded-none" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-desc-en">Description (EN)</Label>
                  <Input id="cat-desc-en" {...form.register("description.en")} className="h-10 rounded-none" />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="h-11 w-full rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-category-save">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto border border-border bg-card" data-testid="admin-categories-table">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3">{t("admin.table.order")}</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3 text-right">{t("admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((cat) => (
              <tr key={cat.id} className="border-b border-border/60" data-testid={`admin-category-row-${cat.slug}`}>
                <td className="px-4 py-3 font-mono">{cat.order}</td>
                <td className="px-4 py-3 font-medium">{tt(cat.name)} <span className="ml-2 text-xs text-muted-foreground">{cat.name.en}</span></td>
                <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3 font-mono">—</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="rounded-none" data-testid={`admin-category-edit-${cat.id}`} onClick={() => openEdit(cat.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDelete onConfirm={() => handleDelete(cat.id)} testId={`admin-category-delete-${cat.id}`}>
                      <Button variant="outline" size="sm" className="rounded-none text-destructive" data-testid={`admin-category-delete-button-${cat.id}`}>
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
      <Reveal>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Urutan mengatur tampilan kategori di halaman depan.
        </p>
      </Reveal>
    </div>
  );
}
