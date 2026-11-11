"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { mockAuthAdapter } from "@/lib/services/auth";
import { forgotSchema, type ForgotValues } from "@/lib/validation/schemas";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "", newPassword: "" },
  });

  const onSubmit = async (values: ForgotValues) => {
    setBusy(true);
    await mockAuthAdapter.updatePassword(values.email, values.newPassword);
    setBusy(false);
    setDone(true);
    toast.success(t("auth.forgot.sent"));
  };

  return (
    <div data-testid="forgot-password-page">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">{t("auth.forgot.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("auth.forgot.subtitle")}</p>

      {done ? (
        <div className="mt-8" data-testid="forgot-success-note">
          <p className="border border-lime bg-lime/10 px-4 py-3 text-sm">{t("auth.forgot.sent")}</p>
          <Link
            href="/login"
            data-testid="forgot-to-login-link"
            className="mt-6 inline-flex h-12 items-center rounded-none bg-foreground px-8 font-semibold text-background hover:bg-foreground/85"
          >
            {t("auth.login.submit")} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" data-testid="forgot-form" noValidate>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">{t("auth.email")}</Label>
            <Input id="forgot-email" type="email" data-testid="forgot-input-email" {...form.register("email")} className="h-12 rounded-none" />
            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="forgot-password">{t("auth.newPassword")}</Label>
            <Input id="forgot-password" type="password" data-testid="forgot-input-password" {...form.register("newPassword")} className="h-12 rounded-none" />
            {form.formState.errors.newPassword && <p className="text-xs text-destructive">{form.formState.errors.newPassword.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={busy || form.formState.isSubmitting}
            data-testid="forgot-submit-button"
            className="h-12 w-full rounded-none bg-foreground text-base font-semibold text-background hover:bg-foreground/85"
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {t("auth.forgot.submit")}
          </Button>
        </form>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        <Link href="/" className="link-underline text-xs" data-testid="forgot-back-home">
          {t("auth.backHome")}
        </Link>
      </p>
    </div>
  );
}
