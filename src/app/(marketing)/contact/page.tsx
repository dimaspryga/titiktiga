"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContent } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { contactSchema, type ContactValues } from "@/lib/validation/schemas";

export default function ContactPage() {
  const { t, tt } = useI18n();
  const { data: content } = useContent();
  const [sent, setSent] = useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values: ContactValues) => {
    setSent(false);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Contact message could not be delivered");

      setSent(true);
      toast.success(t("form.sent"));
      form.reset();
    } catch {
      toast.error(t("form.sendError"));
    }
  };

  const info = [
    { icon: MapPin, label: tt(content?.contact.address), testid: "contact-address" },
    { icon: Mail, label: content?.contact.email ?? "", testid: "contact-email" },
    { icon: Phone, label: content?.contact.phone ?? "", testid: "contact-phone" },
    { icon: Clock, label: tt(content?.contact.hours), testid: "contact-hours" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24" data-testid="contact-page">
      <Reveal>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="mr-3 inline-flex items-center gap-1 align-middle" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-lime" />
            <span className="h-2 w-2 rounded-full bg-foreground/50" />
          </span>
          {t("contact.eyebrow")}
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          {t("contact.title")}
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">{t("contact.subtitle")}</p>
      </Reveal>

      <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("contact.info")}</h2>
          <ul className="mt-6 space-y-6">
            {info.map((item, i) => (
              <li key={i} className="flex items-start gap-4 border-b border-border pb-6" data-testid={item.testid}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="pt-2 text-sm leading-relaxed">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("contact.form.title")}</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6" data-testid="contact-form" noValidate>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">{t("form.name")}</Label>
                <Input id="contact-name" data-testid="contact-input-name" {...form.register("name")} className="h-12 rounded-none" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive" data-testid="contact-error-name">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">{t("form.email")}</Label>
                <Input id="contact-email" type="email" data-testid="contact-input-email" {...form.register("email")} className="h-12 rounded-none" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive" data-testid="contact-error-email">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">{t("form.phone")}</Label>
              <Input id="contact-phone" data-testid="contact-input-phone" {...form.register("phone")} className="h-12 rounded-none" />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive" data-testid="contact-error-phone">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">{t("form.message")}</Label>
              <Textarea id="contact-message" rows={6} data-testid="contact-input-message" {...form.register("message")} className="rounded-none" />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive" data-testid="contact-error-message">{form.formState.errors.message.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              data-testid="contact-submit-button"
              className="h-13 rounded-none bg-foreground px-10 text-base text-background hover:bg-foreground/85"
            >
              {form.formState.isSubmitting ? t("form.sending") : <><Send className="mr-2 h-4 w-4" />{t("form.send")}</>}
            </Button>
            {sent && (
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-lime-foreground [color:hsl(var(--foreground))]" data-testid="contact-success-note">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-lime align-middle" aria-hidden="true" />
                {t("form.sent")}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
