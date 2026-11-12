"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      data-testid="language-toggle"
      className={cn("flex items-center rounded-full border border-border p-0.5 font-mono text-[11px]", className)}
    >
      {(["id", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          data-testid={`language-option-${code}`}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
          className={cn(
            "rounded-full px-2.5 py-1.5 uppercase tracking-widest transition-colors",
            locale === code ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
