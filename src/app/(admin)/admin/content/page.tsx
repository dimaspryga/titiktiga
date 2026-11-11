"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  contentRepo,
  portfolioRepo,
  serviceRepo,
  testimonialRepo,
} from "@/lib/repositories";
import { revalidateAll, useContent, usePortfolio, useProducts, useServices, useTestimonials, useCategories } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { EngagementAdminTab } from "./pricing-tab";
import type { LocalizedText, SiteContent } from "@/lib/types";
import { formatIDR } from "@/lib/utils";

export default function AdminContentPage() {
  const { data: content, isLoading } = useContent();

  if (isLoading || !content) return <div className="h-96 animate-pulse bg-muted/40" />;

  return (
    <div className="space-y-8" data-testid="admin-content-page">
      <div>
        <h1 className="font-display text-3xl font-medium md:text-4xl">Konten</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Perubahan langsung disimpan ke database dan tampil di storefront
        </p>
      </div>

      <Tabs defaultValue="hero" data-testid="admin-content-tabs">
        <TabsList className="flex w-full flex-wrap gap-1 rounded-none bg-transparent p-0">
          {["hero", "about", "contact", "cta", "marquee", "featured", "testimonials", "services", "pricing", "portfolio"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-none border border-border data-[state=active]:bg-foreground data-[state=active]:text-background" data-testid={`admin-content-tab-${tab}`}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <HeroTab content={content} />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <AboutTab content={content} />
        </TabsContent>
        <TabsContent value="contact" className="mt-6">
          <ContactTab content={content} />
        </TabsContent>
        <TabsContent value="cta" className="mt-6">
          <CtaTab content={content} />
        </TabsContent>
        <TabsContent value="marquee" className="mt-6">
          <MarqueeTab content={content} />
        </TabsContent>
        <TabsContent value="featured" className="mt-6">
          <FeaturedTab content={content} />
        </TabsContent>
        <TabsContent value="testimonials" className="mt-6">
          <TestimonialsTab />
        </TabsContent>
        <TabsContent value="services" className="mt-6">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="pricing" className="mt-6">
          <EngagementAdminTab />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-6">
          <PortfolioTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LTField({
  label,
  value,
  onChange,
  rows = 2,
  testIdPrefix,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  rows?: number;
  testIdPrefix: string;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="space-y-1">
        <Label className="font-mono text-[10px] uppercase">{label} (ID)</Label>
        <Textarea
          rows={rows}
          value={value.id}
          data-testid={`${testIdPrefix}-id`}
          onChange={(e) => onChange({ ...value, id: e.target.value })}
          className="rounded-none"
        />
      </div>
      <div className="space-y-1">
        <Label className="font-mono text-[10px] uppercase">{label} (EN)</Label>
        <Textarea
          rows={rows}
          value={value.en}
          data-testid={`${testIdPrefix}-en`}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          className="rounded-none"
        />
      </div>
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  const { t } = useI18n();
  return (
    <Button type="button" onClick={onClick} disabled={saving} className="h-11 rounded-none bg-lime px-8 font-semibold text-lime-foreground hover:bg-lime/85" data-testid="admin-content-save">
      {saving ? "Menyimpan..." : "Simpan"}
    </Button>
  );
}

function HeroTab({ content }: { content: SiteContent }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(content.hero);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(content.hero), [content.hero]);

  return (
    <div className="max-w-3xl space-y-5 border border-border bg-card p-6" data-testid="admin-content-hero">
      <LTField label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => setDraft({ ...draft, eyebrow })} testIdPrefix="hero-eyebrow" />
      {draft.titleLines.map((line, i) => (
        <LTField
          key={i}
          label={`Judul baris ${i + 1}`}
          value={line}
          onChange={(next) => setDraft({ ...draft, titleLines: draft.titleLines.map((l, idx) => (idx === i ? next : l)) })}
          testIdPrefix={`hero-line-${i}`}
        />
      ))}
      <LTField label="Subtitle" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} rows={3} testIdPrefix="hero-subtitle" />
      <div className="space-y-1">
        <Label className="font-mono text-[10px] uppercase">URL gambar hero</Label>
        <Input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="h-10 rounded-none font-mono text-xs" data-testid="hero-image" />
      </div>
      <SaveButton
        saving={saving}
        onClick={async () => {
          setSaving(true);
          await contentRepo.update({ hero: draft });
          revalidateAll();
          toast.success(t("admin.saved"));
          setSaving(false);
        }}
      />
    </div>
  );
}

function AboutTab({ content }: { content: SiteContent }) {
  const { t } = useI18n();
  const [preview, setPreview] = useState(content.aboutPreview);
  const [about, setAbout] = useState(content.aboutPage);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setPreview(content.aboutPreview);
    setAbout(content.aboutPage);
  }, [content.aboutPreview, content.aboutPage]);

  return (
    <div className="max-w-3xl space-y-8 border border-border bg-card p-6" data-testid="admin-content-about">
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Preview Beranda</p>
        <LTField label="Judul" value={preview.title} onChange={(title) => setPreview({ ...preview, title })} testIdPrefix="about-title" />
        <LTField label="Isi" value={preview.body} onChange={(body) => setPreview({ ...preview, body })} rows={3} testIdPrefix="about-body" />
      </div>
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Halaman About</p>
        {about.story.map((para, i) => (
          <LTField
            key={i}
            label={`Cerita paragraf ${i + 1}`}
            value={para}
            onChange={(next) => setAbout({ ...about, story: about.story.map((p, idx) => (idx === i ? next : p)) })}
            rows={2}
            testIdPrefix={`about-story-${i}`}
          />
        ))}
        <LTField label="Visi" value={about.vision} onChange={(vision) => setAbout({ ...about, vision })} rows={2} testIdPrefix="about-vision" />
        {about.mission.map((m, i) => (
          <LTField
            key={i}
            label={`Misi ${i + 1}`}
            value={m}
            onChange={(next) => setAbout({ ...about, mission: about.mission.map((p, idx) => (idx === i ? next : p)) })}
            rows={1}
            testIdPrefix={`about-mission-${i}`}
          />
        ))}
        <LTField label="Filosofi" value={about.philosophy} onChange={(philosophy) => setAbout({ ...about, philosophy })} rows={3} testIdPrefix="about-philosophy" />
        <Input value={about.videoUrl ?? ""} onChange={(event) => setAbout({ ...about, videoUrl: event.target.value })} placeholder="URL video intro (.mp4 / .webm)" className="rounded-none" />
        <Input value={about.videoPoster ?? ""} onChange={(event) => setAbout({ ...about, videoPoster: event.target.value })} placeholder="URL poster video" className="rounded-none" />
      </div>
      <SaveButton
        saving={saving}
        onClick={async () => {
          setSaving(true);
          await contentRepo.update({ aboutPreview: preview, aboutPage: about });
          revalidateAll();
          toast.success(t("admin.saved"));
          setSaving(false);
        }}
      />
    </div>
  );
}

function ContactTab({ content }: { content: SiteContent }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(content.contact);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(content.contact), [content.contact]);

  return (
    <div className="max-w-3xl space-y-5 border border-border bg-card p-6" data-testid="admin-content-contact">
      <LTField label="Alamat" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} testIdPrefix="contact-address" />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="font-mono text-[10px] uppercase">Email</Label>
          <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="h-10 rounded-none" data-testid="contact-email" />
        </div>
        <div className="space-y-1">
          <Label className="font-mono text-[10px] uppercase">Telepon</Label>
          <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="h-10 rounded-none" data-testid="contact-phone" />
        </div>
      </div>
      <LTField label="Jam operasional" value={draft.hours} onChange={(hours) => setDraft({ ...draft, hours })} rows={1} testIdPrefix="contact-hours" />
      <SaveButton
        saving={saving}
        onClick={async () => {
          setSaving(true);
          await contentRepo.update({ contact: draft });
          revalidateAll();
          toast.success(t("admin.saved"));
          setSaving(false);
        }}
      />
    </div>
  );
}

function CtaTab({ content }: { content: SiteContent }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(content.cta);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(content.cta), [content.cta]);

  return (
    <div className="max-w-3xl space-y-5 border border-border bg-card p-6" data-testid="admin-content-cta">
      <LTField label="Judul" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} testIdPrefix="cta-title" />
      <LTField label="Subtitle" value={draft.subtitle} onChange={(subtitle) => setDraft({ ...draft, subtitle })} rows={2} testIdPrefix="cta-subtitle" />
      <LTField label="Tombol" value={draft.button} onChange={(button) => setDraft({ ...draft, button })} rows={1} testIdPrefix="cta-button" />
      <SaveButton
        saving={saving}
        onClick={async () => {
          setSaving(true);
          await contentRepo.update({ cta: draft });
          revalidateAll();
          toast.success(t("admin.saved"));
          setSaving(false);
        }}
      />
    </div>
  );
}

function MarqueeTab({ content }: { content: SiteContent }) {
  const { t } = useI18n();
  const [items, setItems] = useState(content.marquee);
  const [saving, setSaving] = useState(false);
  useEffect(() => setItems(content.marquee), [content.marquee]);

  return (
    <div className="max-w-3xl space-y-5 border border-border bg-card p-6" data-testid="admin-content-marquee">
      {items.map((item, i) => (
        <LTField
          key={i}
          label={`Item ${i + 1}`}
          value={item}
          onChange={(next) => setItems(items.map((m, idx) => (idx === i ? next : m)))}
          rows={1}
          testIdPrefix={`marquee-${i}`}
        />
      ))}
      <SaveButton
        saving={saving}
        onClick={async () => {
          setSaving(true);
          await contentRepo.update({ marquee: items.filter((m) => m.id.trim()) });
          revalidateAll();
          toast.success(t("admin.saved"));
          setSaving(false);
        }}
      />
    </div>
  );
}

function FeaturedTab({ content }: { content: SiteContent }) {
  const { t } = useI18n();
  const { data: products } = useProducts({ includeDrafts: true, perPage: 100 });
  const { data: categories } = useCategories();
  const [ids, setIds] = useState(content.featuredProductIds);
  const [slugs, setSlugs] = useState(content.featuredCategorySlugs);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setIds(content.featuredProductIds);
    setSlugs(content.featuredCategorySlugs);
  }, [content.featuredProductIds, content.featuredCategorySlugs]);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div className="max-w-3xl space-y-8 border border-border bg-card p-6" data-testid="admin-content-featured">
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Produk unggulan</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(products?.items ?? []).map((p) => (
            <label key={p.id} className="flex items-center gap-3 border border-border px-3 py-2 text-sm transition-colors hover:bg-accent" data-testid={`admin-featured-product-${p.id}`}>
              <input type="checkbox" checked={ids.includes(p.id)} onChange={() => setIds((prev) => toggle(prev, p.id))} className="accent-[hsl(var(--lime))]" />
              {p.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Kategori unggulan</p>
        <div className="flex flex-wrap gap-2">
          {(categories ?? []).map((c) => (
            <button
              key={c.slug}
              type="button"
              data-testid={`admin-featured-category-${c.slug}`}
              onClick={() => setSlugs((prev) => toggle(prev, c.slug))}
              className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${slugs.includes(c.slug) ? "border-lime bg-lime text-lime-foreground" : "border-border hover:bg-accent"}`}
            >
              {c.slug}
            </button>
          ))}
        </div>
      </div>
      <SaveButton
        saving={saving}
        onClick={async () => {
          setSaving(true);
          await contentRepo.update({ featuredProductIds: ids, featuredCategorySlugs: slugs });
          revalidateAll();
          toast.success(t("admin.saved"));
          setSaving(false);
        }}
      />
    </div>
  );
}

function TestimonialsTab() {
  const { t, tt } = useI18n();
  const { testimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ quote: { id: "", en: "" }, name: "", role: { id: "", en: "" }, avatar: "" });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setDraft({ quote: { id: "", en: "" }, name: "", role: { id: "", en: "" }, avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=200&auto=format&fit=crop" });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    if (editing) await updateTestimonial(editing, draft);
    else await createTestimonial(draft);
    toast.success(t("admin.saved"));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="max-w-3xl space-y-4 border border-border bg-card p-6" data-testid="admin-content-testimonials">
      <div className="flex justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Daftar testimoni</p>
        <Button size="sm" variant="outline" className="rounded-none" onClick={openCreate} data-testid="admin-testimonial-new">
          <Plus className="mr-1 h-3.5 w-3.5" /> Tambah
        </Button>
      </div>
      {(testimonials ?? []).map((tst) => (
        <div key={tst.id} className="flex items-start justify-between gap-4 border-b border-border/60 pb-4" data-testid={`admin-testimonial-row-${tst.id}`}>
          <div>
            <p className="text-sm leading-relaxed">“{tt(tst.quote)}”</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{tst.name}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              data-testid={`admin-testimonial-edit-${tst.id}`}
              onClick={() => {
                setEditing(tst.id);
                setDraft({ quote: tst.quote, name: tst.name, role: tst.role, avatar: tst.avatar });
                setOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <ConfirmDelete onConfirm={async () => { await deleteTestimonial(tst.id); toast.success(t("admin.deleted")); }} testId={`admin-testimonial-delete-${tst.id}`}>
              <Button variant="outline" size="sm" className="rounded-none text-destructive" data-testid={`admin-testimonial-delete-button-${tst.id}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDelete>
          </div>
        </div>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Testimoni" : "Testimoni Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <LTField label="Kutipan" value={draft.quote} onChange={(quote) => setDraft({ ...draft, quote })} rows={3} testIdPrefix="tst-quote" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="font-mono text-[10px] uppercase">Nama</Label>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="h-10 rounded-none" data-testid="tst-name" />
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[10px] uppercase">URL avatar</Label>
                <Input value={draft.avatar} onChange={(e) => setDraft({ ...draft, avatar: e.target.value })} className="h-10 rounded-none font-mono text-xs" data-testid="tst-avatar" />
              </div>
            </div>
            <LTField label="Peran" value={draft.role} onChange={(role) => setDraft({ ...draft, role })} rows={1} testIdPrefix="tst-role" />
            <SaveButton saving={saving} onClick={save} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServicesTab() {
  const { t, tt } = useI18n();
  const { services, updateService } = useServices();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: { id: "", en: "" },
    description: { id: "", en: "" },
    deliverablesText: { id: "", en: "" },
    priceFrom: "",
    image: "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = {
      title: draft.title,
      description: draft.description,
      deliverables: [
        { id: draft.deliverablesText.id, en: draft.deliverablesText.en },
      ],
      priceFrom: Number(draft.priceFrom) || 0,
      image: draft.image,
    };
    if (editing) await updateService(editing, payload);
    toast.success(t("admin.saved"));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="max-w-3xl space-y-4 border border-border bg-card p-6" data-testid="admin-content-services">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ubah layanan (ID/EN)</p>
      {(services ?? []).map((svc) => (
        <div key={svc.id} className="flex items-center justify-between gap-4 border-b border-border/60 pb-4" data-testid={`admin-service-row-${svc.slug}`}>
          <div>
            <p className="font-medium">{svc.index} — {tt(svc.title)}</p>
            <p className="text-xs text-muted-foreground">{t("services.priceFrom")} {formatIDR(svc.priceFrom)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            data-testid={`admin-service-edit-${svc.id}`}
            onClick={() => {
              setEditing(svc.id);
              setDraft({
                title: svc.title,
                description: svc.description,
                deliverablesText: {
                  id: svc.deliverables.map((d) => d.id).join(", "),
                  en: svc.deliverables.map((d) => d.en).join(", "),
                },
                priceFrom: String(svc.priceFrom),
                image: svc.image ?? "",
              });
              setOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Ubah Layanan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <LTField label="Judul" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} rows={1} testIdPrefix="svc-title" />
            <LTField label="Deskripsi" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} rows={3} testIdPrefix="svc-desc" />
            <LTField label="Deliverables (pisahkan dengan koma)" value={draft.deliverablesText} onChange={(deliverablesText) => setDraft({ ...draft, deliverablesText })} rows={2} testIdPrefix="svc-deliv" />
            <div className="space-y-1">
              <Label className="font-mono text-[10px] uppercase">Harga mulai (Rp)</Label>
              <Input type="number" value={draft.priceFrom} onChange={(e) => setDraft({ ...draft, priceFrom: e.target.value })} className="h-10 rounded-none" data-testid="svc-price" />
            </div>
            <div className="space-y-1">
              <Label className="font-mono text-[10px] uppercase">Gambar latar layanan</Label>
              <Input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="/uploads/nama-gambar.jpg atau URL gambar" className="h-10 rounded-none" data-testid="svc-image" />
            </div>
            <SaveButton saving={saving} onClick={save} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PortfolioTab() {
  const { t, tt } = useI18n();
  const { projects, updateProject } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    client: "",
    year: 2025,
    category: { id: "", en: "" },
    description: { id: "", en: "" },
    cover: "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (editing) await updateProject(editing, draft);
    toast.success(t("admin.saved"));
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="max-w-3xl space-y-4 border border-border bg-card p-6" data-testid="admin-content-portfolio">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ubah proyek portofolio</p>
      {(projects ?? []).map((pf) => (
        <div key={pf.id} className="flex items-center justify-between gap-4 border-b border-border/60 pb-4" data-testid={`admin-portfolio-row-${pf.slug}`}>
          <div>
            <p className="font-medium">{pf.title}</p>
            <p className="text-xs text-muted-foreground">{pf.client} — {pf.year}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            data-testid={`admin-portfolio-edit-${pf.id}`}
            onClick={() => {
              setEditing(pf.id);
              setDraft({ title: pf.title, client: pf.client, year: pf.year, category: pf.category, description: pf.description, cover: pf.cover });
              setOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Ubah Proyek</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="font-mono text-[10px] uppercase">Judul</Label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="h-10 rounded-none" data-testid="pf-title" />
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[10px] uppercase">Klien</Label>
                <Input value={draft.client} onChange={(e) => setDraft({ ...draft, client: e.target.value })} className="h-10 rounded-none" data-testid="pf-client" />
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[10px] uppercase">Tahun</Label>
                <Input type="number" value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })} className="h-10 rounded-none" data-testid="pf-year" />
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-[10px] uppercase">URL cover</Label>
                <Input value={draft.cover} onChange={(e) => setDraft({ ...draft, cover: e.target.value })} className="h-10 rounded-none font-mono text-xs" data-testid="pf-cover" />
              </div>
            </div>
            <LTField label="Kategori" value={draft.category} onChange={(category) => setDraft({ ...draft, category })} rows={1} testIdPrefix="pf-category" />
            <LTField label="Deskripsi" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} rows={3} testIdPrefix="pf-desc" />
            <SaveButton saving={saving} onClick={save} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
