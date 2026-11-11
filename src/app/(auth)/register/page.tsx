"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { mockAuthAdapter } from "@/lib/services/auth";
import { consumeIntent, sanitizeReturnPath } from "@/lib/services/intent";
import { productRepo } from "@/lib/repositories";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { registerSchema, type RegisterValues } from "@/lib/validation/schemas";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionLogin = useSessionStore((s) => s.login);
  const [busy, setBusy] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const returnTo = sanitizeReturnPath(searchParams.get("returnTo") ?? "/", "/");

  const onSubmit = async (values: RegisterValues) => {
    setBusy(true);
    const result = await mockAuthAdapter.register(values.name, values.email, values.password);
    if (result.error || (!result.session && !result.pendingVerification)) {
      toast.error(t(result.error ?? "auth.error.exists"));
      setBusy(false);
      return;
    }
    if (result.pendingVerification) {
      toast.success(`Link verifikasi telah dikirim ke ${result.email}`);
      router.push(`/login?verifyEmail=${encodeURIComponent(result.email)}&returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    sessionLogin(result.session!);
    toast.success(t("auth.register.success"));
    const intent = consumeIntent();
    if (intent) {
      const product = await productRepo.getById(intent.productId);
      if (product) {
        useCartStore.getState().add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? "",
          price: product.price,
          discountPercent: product.discountPercent,
          stock: product.stock,
          quantity: intent.quantity,
        });
      }
      router.push(intent.type === "buy-now" ? "/checkout" : returnTo);
    } else {
      router.push(returnTo);
    }
  };

  return (
    <div data-testid="register-page">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">{t("auth.register.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("auth.register.subtitle")}</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" data-testid="register-form" noValidate>
        <div className="space-y-2">
          <Label htmlFor="register-name">{t("auth.name")}</Label>
          <Input id="register-name" autoComplete="name" data-testid="register-input-name" {...form.register("name")} className="h-12 rounded-none" />
          {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">{t("auth.email")}</Label>
          <Input id="register-email" type="email" autoComplete="email" data-testid="register-input-email" {...form.register("email")} className="h-12 rounded-none" />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">{t("auth.password")}</Label>
          <Input id="register-password" type="password" autoComplete="new-password" data-testid="register-input-password" {...form.register("password")} className="h-12 rounded-none" />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">{t("auth.confirmPassword")}</Label>
          <Input id="register-confirm" type="password" autoComplete="new-password" data-testid="register-input-confirm" {...form.register("confirmPassword")} className="h-12 rounded-none" />
          {form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
        </div>
        <Button
          type="submit"
          disabled={busy || form.formState.isSubmitting}
          data-testid="register-submit-button"
          className="h-12 w-full rounded-none bg-lime text-base font-semibold text-lime-foreground hover:bg-lime/85"
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
          {t("auth.register.submit")}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        {t("auth.register.haveAccount")}{" "}
        <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="link-underline font-medium text-foreground" data-testid="register-to-login-link">
          {t("nav.login")}
        </Link>
      </p>
    </div>
  );
}
