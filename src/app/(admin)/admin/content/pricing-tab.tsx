"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEngagement } from "@/lib/hooks";
import { engagementRepo } from "@/lib/repositories";

export function EngagementAdminTab() {
  const { engagement: data, updateEngagement } = useEngagement();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setDraft(JSON.stringify(data, null, 2));
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(draft);
      await updateEngagement(parsed);
      toast.success("Konten pricing dan layanan berhasil disimpan");
    } catch {
      toast.error("Format JSON tidak valid");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-4 border border-border bg-card p-6">
      <div>
        <h2 className="font-display text-2xl">Pricing & cara kerja</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola paket, periode diskon, FAQ, gambar kelima langkah layanan, dan teks undangan.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="engagement-json">Konten JSON</Label>
        <Textarea
          id="engagement-json"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={24}
          className="rounded-none font-mono text-xs leading-relaxed"
        />
      </div>
      <Button onClick={save} disabled={saving} className="rounded-none bg-lime text-lime-foreground hover:bg-lime/85">
        {saving ? "Menyimpan..." : "Simpan pricing & layanan"}
      </Button>
    </div>
  );
}
