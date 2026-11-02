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
import { voucherRepo } from "@/lib/repositories";
import { revalidateAll, useCategories, useVouchers } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { voucherSchema, type VoucherFormValues } from "@/lib/validation/schemas";
import type { Voucher } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

export default function AdminVouchersPage() {
  const { t } = useI18n();
  const { data: vouchers } = useVouchers();
  const { data: categories } = useCategories();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState<string[]>([]);

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      type: "percentage",
      value: undefined as unknown as number,
      minPurchase: 0,
      maxDiscount: null,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: "2026-12-31",
      usageLimit: null,
      active: true,
    },
  });

  const openCreate = () => {
    setEditing(null);
    setEligible([]);
    form.reset({
      code: "",
      type: "percentage",
      value: undefined as unknown as number,
      minPurchase: 0,
      maxDiscount: null,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: "2026-12-31",
      usageLimit: null,
      active: true,
    });
    setOpen(true);
  };

  const openEdit = (voucher: Voucher) => {
    setEditing(voucher.id);
    setEligible(voucher.eligibleCategories ?? []);
    form.reset({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minPurchase: voucher.minPurchase,
      maxDiscount: voucher.maxDiscount,
      startDate: voucher.startDate.slice(0, 10),
      expiryDate: voucher.expiryDate.slice(0, 10),
      usageLimit: voucher.usageLimit,
      active: voucher.active,
    });
    setOpen(true);
  };

  const toggleEligible = (slug: string) => {
    setEligible((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const submit = async (values: VoucherFormValues) => {
    setSubmitting(true);
    const payload = {
      code: values.code,
      type: values.type,
      value: Number(values.value),
      minPurchase: Number(values.minPurchase),
      maxDiscount: values.maxDiscount ?? null,
      startDate: values.startDate,
      expiryDate: values.expiryDate,
      usageLimit: values.usageLimit ?? null,
      active: values.active,
      eligibleCategories: eligible.length > 0 ? eligible : null,
    };
    if (editing) await voucherRepo.update(editing, payload);
    else await voucherRepo.create(payload);
    revalidateAll();
    toast.success(t("admin.saved"));
    setSubmitting(false);
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await voucherRepo.remove(id);
    revalidateAll();
    toast.success(t("admin.deleted"));
  };

  return (
    <div className="space-y-8" data-testid="admin-vouchers-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.vouchers")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-voucher-new" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> {t("admin.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Ubah Voucher" : "Voucher Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4" data-testid="admin-voucher-form" noValidate>
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="v-code">Kode</Label>
                  <Input id="v-code" data-testid="admin-voucher-code" {...form.register("code")} className="h-10 rounded-none font-mono uppercase" />
                  {form.formState.errors.code && <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Tipe</Label>
                  <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v as "percentage" | "fixed")}>
                    <SelectTrigger className="h-10 w-full rounded-none" data-testid="admin-voucher-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="percentage">{t("voucher.type.percentage")}</SelectItem>
                      <SelectItem value="fixed">{t("voucher.type.fixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-value">Nilai</Label>
                  <Input id="v-value" type="number" data-testid="admin-voucher-value" {...form.register("value")} className="h-10 rounded-none" />
                  {form.formState.errors.value && <p className="text-xs text-destructive">{form.formState.errors.value.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="v-min">{t("voucher.minPurchase")}</Label>
                  <Input id="v-min" type="number" {...form.register("minPurchase")} className="h-10 rounded-none" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-max">{t("voucher.maxDiscount")}</Label>
                  <Input id="v-max" type="number" placeholder="—" {...form.register("maxDiscount")} className="h-10 rounded-none" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-start">{t("voucher.startDate")}</Label>
                  <Input id="v-start" type="date" {...form.register("startDate")} className="h-10 rounded-none" />
                  {form.formState.errors.startDate && <p className="text-xs text-destructive">{form.formState.errors.startDate.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v-expiry">{t("voucher.expiryDate")}</Label>
                  <Input id="v-expiry" type="date" {...form.register("expiryDate")} className="h-10 rounded-none" />
                  {form.formState.errors.expiryDate && <p className="text-xs text-destructive">{form.formState.errors.expiryDate.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-limit">{t("voucher.usageLimit")}</Label>
                <Input id="v-limit" type="number" placeholder="—" {...form.register("usageLimit")} className="h-10 rounded-none" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("voucher.eligible")}</Label>
                <div className="flex flex-wrap gap-2" data-testid="admin-voucher-eligible">
                  {(categories ?? []).map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      data-testid={`admin-voucher-cat-${c.slug}`}
                      onClick={() => toggleEligible(c.slug)}
                      className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${eligible.includes(c.slug) ? "border-lime bg-lime text-lime-foreground" : "border-border hover:bg-accent"}`}
                    >
                      {c.slug}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border border-border px-4 py-3">
                <Label htmlFor="v-active">{t("promo.active")}</Label>
                <Switch id="v-active" checked={form.watch("active")} onCheckedChange={(v) => form.setValue("active", v)} data-testid="admin-voucher-active" />
              </div>
              <Button type="submit" disabled={submitting} className="h-11 w-full rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-voucher-save">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto border border-border bg-card" data-testid="admin-vouchers-table">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Nilai</th>
              <th className="px-4 py-3">{t("voucher.minPurchase")}</th>
              <th className="px-4 py-3">{t("admin.table.period")}</th>
              <th className="px-4 py-3">{t("admin.table.used")}</th>
              <th className="px-4 py-3">{t("admin.table.status")}</th>
              <th className="px-4 py-3 text-right">{t("admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {(vouchers ?? []).map((voucher) => (
              <tr key={voucher.id} className="border-b border-border/60" data-testid={`admin-voucher-row-${voucher.code}`}>
                <td className="px-4 py-3 font-mono font-bold">
                  {voucher.code}
                  {voucher.eligibleCategories && (
                    <span className="ml-2 text-[10px] font-normal text-muted-foreground">{voucher.eligibleCategories.join(", ")}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {voucher.type === "percentage" ? `${voucher.value}%` : formatIDR(voucher.value)}
                  {voucher.maxDiscount ? <span className="ml-1 text-xs text-muted-foreground">max {formatIDR(voucher.maxDiscount)}</span> : null}
                </td>
                <td className="px-4 py-3">{formatIDR(voucher.minPurchase)}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {voucher.startDate} → {voucher.expiryDate}
                </td>
                <td className="px-4 py-3 font-mono">{voucher.usedCount}{voucher.usageLimit ? `/${voucher.usageLimit}` : ""}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${voucher.active ? "bg-lime text-lime-foreground" : "bg-muted"}`} data-testid={`admin-voucher-status-${voucher.code}`}>
                    {voucher.active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="rounded-none" data-testid={`admin-voucher-edit-${voucher.id}`} onClick={() => openEdit(voucher)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDelete onConfirm={() => handleDelete(voucher.id)} testId={`admin-voucher-delete-${voucher.id}`}>
                      <Button variant="outline" size="sm" className="rounded-none text-destructive" data-testid={`admin-voucher-delete-button-${voucher.id}`}>
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
