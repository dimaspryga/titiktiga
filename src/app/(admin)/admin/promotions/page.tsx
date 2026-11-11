"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { promotionRepo } from "@/lib/repositories";
import { revalidateAll, usePromotions } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { promotionSchema, type PromotionFormValues } from "@/lib/validation/schemas";
import type { Promotion } from "@/lib/types";

export default function AdminPromotionsPage() {
  const { t, tt } = useI18n();
  const { promotions, createPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: { placement: "announcement", title: { id: "", en: "" }, code: "", active: true },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ placement: "announcement", title: { id: "", en: "" }, code: "", active: true });
    setOpen(true);
  };

  const openEdit = (promo: Promotion) => {
    setEditing(promo.id);
    form.reset({
      placement: promo.placement,
      title: promo.title,
      code: promo.code ?? "",
      active: promo.active,
    });
    setOpen(true);
  };

  const submit = async (values: PromotionFormValues) => {
    setSubmitting(true);
    const payload = {
      placement: values.placement,
      title: values.title,
      code: values.code ? values.code.toUpperCase() : null,
      active: values.active,
    };
    if (editing) await updatePromotion(editing, payload);
    else await createPromotion(payload);
    toast.success(t("admin.saved"));
    setSubmitting(false);
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deletePromotion(id);
    toast.success(t("admin.deleted"));
  };

  const toggleActive = async (promo: Promotion) => {
    await updatePromotion(promo.id, { active: !promo.active });
  };

  return (
    <div className="space-y-8" data-testid="admin-promotions-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.promotions")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-promotion-new" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> {t("admin.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Ubah Promosi" : "Promosi Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4" data-testid="admin-promotion-form" noValidate>
              <div className="space-y-1.5">
                <Label>{t("promo.placement")}</Label>
                <Select value={form.watch("placement")} onValueChange={(v) => form.setValue("placement", v as Promotion["placement"])}>
                  <SelectTrigger className="h-10 w-full rounded-none" data-testid="admin-promotion-placement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="announcement">{t("promo.placement.announcement")}</SelectItem>
                    <SelectItem value="home-banner">{t("promo.placement.homeBanner")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-title-id">Judul (ID)</Label>
                  <Input id="p-title-id" data-testid="admin-promotion-title-id" {...form.register("title.id")} className="h-10 rounded-none" />
                  {form.formState.errors.title?.id && <p className="text-xs text-destructive">{form.formState.errors.title.id.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-title-en">Title (EN)</Label>
                  <Input id="p-title-en" {...form.register("title.en")} className="h-10 rounded-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-code">{t("promo.code")}</Label>
                  <Input id="p-code" {...form.register("code")} className="h-10 rounded-none font-mono uppercase" />
                </div>
                <div className="flex items-center justify-between border border-border px-4 py-2">
                  <Label htmlFor="p-active">{t("promo.active")}</Label>
                  <Switch id="p-active" checked={form.watch("active")} onCheckedChange={(v) => form.setValue("active", v)} data-testid="admin-promotion-active" />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="h-11 w-full rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-promotion-save">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto border border-border bg-card" data-testid="admin-promotions-table">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3">{t("promo.placement")}</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">{t("promo.code")}</th>
              <th className="px-4 py-3">{t("promo.active")}</th>
              <th className="px-4 py-3 text-right">{t("admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {(promotions ?? []).map((promo) => (
              <tr key={promo.id} className="border-b border-border/60" data-testid={`admin-promotion-row-${promo.id}`}>
                <td className="px-4 py-3 font-mono text-xs">{t(promo.placement === "announcement" ? "promo.placement.announcement" : "promo.placement.homeBanner")}</td>
                <td className="px-4 py-3">{tt(promo.title)}</td>
                <td className="px-4 py-3 font-mono text-xs">{promo.code ?? "—"}</td>
                <td className="px-4 py-3">
                  <Switch checked={promo.active} onCheckedChange={() => toggleActive(promo)} data-testid={`admin-promotion-toggle-${promo.id}`} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="rounded-none" data-testid={`admin-promotion-edit-${promo.id}`} onClick={() => openEdit(promo)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDelete onConfirm={() => handleDelete(promo.id)} testId={`admin-promotion-delete-${promo.id}`}>
                      <Button variant="outline" size="sm" className="rounded-none text-destructive" data-testid={`admin-promotion-delete-button-${promo.id}`}>
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
