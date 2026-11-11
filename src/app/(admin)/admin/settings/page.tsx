"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ExternalLink,
  Sparkles,
  WalletCards,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contentRepo } from "@/lib/repositories";
import { revalidateAll, useContent, useMidtransStatus } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";

export default function AdminSettingsPage() {
  const { t } = useI18n();
  const { content, updateContent } = useContent();
  const { data: midtransStatus, refetch: refetchMidtrans } = useMidtransStatus();
  const [store, setStore] = useState(content?.store);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content?.store) setStore(content.store);
  }, [content?.store]);

  if (!store) return <div className="h-96 animate-pulse bg-muted/40" />;

  const isConfigured = Boolean(midtransStatus?.isConfigured);

  return (
    <div className="max-w-3xl space-y-10" data-testid="admin-settings-page">
      <div>
        <h1 className="font-display text-3xl font-medium md:text-4xl">{t("admin.settings")}</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Identitas toko, payment gateway, &amp; pengiriman
        </p>
      </div>

      {/* Card Identitas Toko */}
      <div className="space-y-5 border border-border bg-card p-6" data-testid="admin-settings-store">
        <h2 className="font-display text-xl font-medium">Identitas Toko</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Nama toko</Label>
            <Input
              id="s-name"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              className="h-11 rounded-none"
              data-testid="admin-settings-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-tagline-id">Tagline (ID)</Label>
            <Input
              id="s-tagline-id"
              value={store.tagline.id}
              onChange={(e) => setStore({ ...store, tagline: { ...store.tagline, id: e.target.value } })}
              className="h-11 rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-tagline-en">Tagline (EN)</Label>
            <Input
              id="s-tagline-en"
              value={store.tagline.en}
              onChange={(e) => setStore({ ...store, tagline: { ...store.tagline, en: e.target.value } })}
              className="h-11 rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-currency">Mata uang</Label>
            <Input
              id="s-currency"
              value="IDR (Rupiah)"
              disabled
              className="h-11 rounded-none font-mono text-xs"
              data-testid="admin-settings-currency"
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await updateContent({ store });
            toast.success(t("admin.saved"));
            setSaving(false);
          }}
          className="h-11 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85"
          data-testid="admin-settings-save"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      {/* Card Midtrans Payment Gateway */}
      <div className="space-y-5 border border-border bg-card p-6" data-testid="admin-settings-midtrans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-lime text-lime-foreground">
              <WalletCards className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl font-medium">Payment Gateway (Midtrans)</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Mendukung QRIS, GoPay, ShopeePay, Virtual Account &amp; Kartu Kredit
              </p>
            </div>
          </div>
          {isConfigured ? (
            <Badge variant="outline" className="gap-1 border-lime text-lime font-mono text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" /> Terhubung ({midtransStatus?.environment})
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-lime/60 text-lime font-mono text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Siap Pakai (Tinggal Masukkan Keys)
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border border-border p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Client Key
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              {midtransStatus?.clientKeyConfigured ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> Terpasang
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Belum diisi
                </>
              )}
            </p>
          </div>
          <div className="border border-border p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Server Key
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              {midtransStatus?.serverKeyConfigured ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-lime" /> Terpasang
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Belum diisi
                </>
              )}
            </p>
          </div>
          <div className="border border-border p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Environment
            </p>
            <p className="mt-1 font-mono text-xs font-semibold capitalize">
              {midtransStatus?.environment ?? "sandbox"}
            </p>
          </div>
        </div>

        <div className="rounded border border-lime/30 bg-lime/10 p-4 text-xs leading-relaxed space-y-2">
          <p className="font-semibold text-lime flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Panduan Aktivasi Cepat:
          </p>
          <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
            <li>
              Buka Midtrans Dashboard (
              <a
                href="https://dashboard.midtrans.com/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground inline-flex items-center gap-0.5 text-foreground"
              >
                dashboard.midtrans.com <ExternalLink className="h-3 w-3 inline" />
              </a>
              ) &rarr; masuk ke menu <strong>Settings</strong> &rarr; <strong>Access Keys</strong>.
            </li>
            <li>Salin <strong>Client Key</strong> dan <strong>Server Key</strong> Anda.</li>
            <li>
              Buka file <code className="bg-background px-1.5 py-0.5 font-mono text-foreground">.env.local</code> di project ini, lalu isi:
              <pre className="mt-1 overflow-x-auto rounded border border-border bg-background p-2.5 font-mono text-[11px] text-foreground">
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-yyyyyyyy
MIDTRANS_IS_PRODUCTION=false
              </pre>
            </li>
            <li>Simpan file dan restart server. Semua pembayaran akan langsung aktif secara otomatis tanpa perlu modifikasi kode apa pun lagi!</li>
          </ol>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            refetchMidtrans();
            toast.success("Status koneksi Midtrans diperbarui");
          }}
          className="rounded-none text-xs"
        >
          Cek Ulang Status Koneksi
        </Button>
      </div>
    </div>
  );
}
