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
import { consumeIntent, loginUrl, sanitizeReturnPath } from "@/lib/services/intent";
import { productRepo } from "@/lib/repositories";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { loginSchema, type LoginValues } from "@/lib/validation/schemas";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionLogin = useSessionStore((s) => s.login);
  const [busy, setBusy] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const returnTo = sanitizeReturnPath(searchParams.get("returnTo") ?? "/", "/");

  const onSubmit = async (values: LoginValues) => {
    setBusy(true);
    const result = await mockAuthAdapter.login(values.email, values.password);
    if (result.error || !result.session) {
      toast.error(t(result.error ?? "auth.error.invalid"));
      setBusy(false);
      return;
    }
    sessionLogin(result.session!);
    toast.success(t("auth.login.success"));
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
    } else if (result.session.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push(returnTo);
    }
  };

  return (
    <div data-testid="login-page">
      <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">{t("auth.login.title")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("auth.login.subtitle")}</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5" data-testid="login-form" noValidate>
        <div className="space-y-2">
          <Label htmlFor="login-email">{t("auth.email")}</Label>
          <Input id="login-email" type="email" autoComplete="email" data-testid="login-input-email" {...form.register("email")} className="h-12 rounded-none" />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">{t("auth.password")}</Label>
          <Input id="login-password" type="password" autoComplete="current-password" data-testid="login-input-password" {...form.register("password")} className="h-12 rounded-none" />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <Button
          type="submit"
          disabled={busy || form.formState.isSubmitting}
          data-testid="login-submit-button"
          className="h-12 w-full rounded-none bg-foreground text-base font-semibold text-background hover:bg-foreground/85"
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
          {t("auth.login.submit")}
        </Button>
      </form>

      <div className="mt-8 space-y-3 text-sm text-muted-foreground">
        <p>
          {t("auth.login.noAccount")}{" "}
          <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="link-underline font-medium text-foreground" data-testid="login-to-register-link">
            {t("nav.register")}
          </Link>
        </p>
        <p>
          <Link href="/forgot-password" className="link-underline font-medium text-foreground" data-testid="login-to-forgot-link">
            {t("auth.forgot.link")}
          </Link>
        </p>
        <p>
          <Link href="/" className="link-underline text-xs" data-testid="login-back-home">
            {t("auth.backHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}
