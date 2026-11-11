"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerRepo } from "@/lib/repositories";
import { revalidateAll, useCustomers } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";

const customerFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor minimal 8 digit"),
});
type CustomerFormValues = z.input<typeof customerFormSchema>;

export default function AdminCustomersPage() {
  const { t } = useI18n();
  const { data: customers } = useCustomers();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const submit = async (values: CustomerFormValues) => {
    setSubmitting(true);
    await customerRepo.create({
      name: values.name,
      email: values.email,
      phone: values.phone,
      joinedAt: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
    });
    revalidateAll();
    toast.success(t("admin.saved"));
    setSubmitting(false);
    setOpen(false);
    form.reset();
  };

  const handleDelete = async (id: string) => {
    await customerRepo.remove(id);
    revalidateAll();
    toast.success(t("admin.deleted"));
  };

  return (
    <div className="space-y-8" data-testid="admin-customers-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.customers")}</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Daftar seluruh pelanggan terdaftar</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-customer-new">
              + {t("admin.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Pelanggan Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4" data-testid="admin-customer-form" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="cus-name">Nama</Label>
                <Input id="cus-name" data-testid="admin-customer-name" {...form.register("name")} className="h-10 rounded-none" />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cus-email">Email</Label>
                <Input id="cus-email" data-testid="admin-customer-email" {...form.register("email")} className="h-10 rounded-none" />
                {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cus-phone">Telepon</Label>
                <Input id="cus-phone" data-testid="admin-customer-phone" {...form.register("phone")} className="h-10 rounded-none" />
              </div>
              <Button type="submit" disabled={submitting} className="h-11 w-full rounded-none bg-lime font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-customer-save">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto border border-border bg-card" data-testid="admin-customers-table">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3">Pesanan</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">{t("admin.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((customer) => (
              <tr key={customer.id} className="border-b border-border/60" data-testid={`admin-customer-row-${customer.id}`}>
                <td className="px-4 py-3 font-medium">{customer.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{customer.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{customer.phone}</td>
                <td className="px-4 py-3 font-mono">{customer.ordersCount}</td>
                <td className="px-4 py-3 font-semibold">{formatIDR(customer.totalSpent)}</td>
                <td className="px-4 py-3 text-right">
                  <ConfirmDelete onConfirm={() => handleDelete(customer.id)} testId={`admin-customer-delete-${customer.id}`}>
                    <Button variant="outline" size="sm" className="rounded-none text-destructive" data-testid={`admin-customer-delete-button-${customer.id}`}>
                      Hapus
                    </Button>
                  </ConfirmDelete>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
