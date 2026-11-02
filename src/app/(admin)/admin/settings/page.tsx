"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contentRepo } from "@/lib/repositories";
import { useMockDb } from "@/lib/repositories/db";
import { revalidateAll, useContent } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function AdminSettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: content } = useContent();
  const [store, setStore] = useState(content?.store);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (content?.store) setStore(content.store);
  }, [content?.store]);

  if (!store) return <div className="h-96 animate-pulse bg-muted/40" />;

  return (
    <div className="max-w-3xl space-y-10" data-testid="admin-settings-page">
      <div>
        <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.settings")}</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Identitas toko & pengiriman (demo)</p>
      </div>

      <div className="space-y-5 border border-border bg-card p-6" data-testid="admin-settings-store">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Nama toko</Label>
            <Input id="s-name" value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} className="h-11 rounded-none" data-testid="admin-settings-name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-tagline-id">Tagline (ID)</Label>
            <Input id="s-tagline-id" value={store.tagline.id} onChange={(e) => setStore({ ...store, tagline: { ...store.tagline, id: e.target.value } })} className="h-11 rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-tagline-en">Tagline (EN)</Label>
            <Input id="s-tagline-en" value={store.tagline.en} onChange={(e) => setStore({ ...store, tagline: { ...store.tagline, en: e.target.value } })} className="h-11 rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-currency">Mata uang</Label>
            <Input id="s-currency" value="IDR (tetap — demo)" disabled className="h-11 rounded-none font-mono text-xs" data-testid="admin-settings-currency" />
          </div>
        </div>
        <Button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await contentRepo.update({ store });
            revalidateAll();
            toast.success(t("admin.saved"));
            setSaving(false);
          }}
          className="h-11 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85"
          data-testid="admin-settings-save"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      <div className="border border-destructive/40 bg-destructive/5 p-6" data-testid="admin-settings-reset">
        <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-destructive">
          <RotateCcw className="h-5 w-5" /> {t("admin.reset.title")}
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">{t("admin.reset.body")}</p>
        <ConfirmDelete
          title={t("admin.reset.title")}
          description={t("admin.reset.body")}
          onConfirm={async () => {
            setResetting(true);
            useMockDb.getState().reset();
            toast.success(t("admin.reset.done"));
            revalidateAll();
            setTimeout(() => router.push("/admin/dashboard"), 800);
          }}
          testId="admin-reset-trigger"
        >
          <Button variant="outline" className="mt-4 rounded-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" data-testid="admin-settings-reset-button" disabled={resetting}>
            {t("admin.reset.action")}
          </Button>
        </ConfirmDelete>
      </div>
    </div>
  );
}
