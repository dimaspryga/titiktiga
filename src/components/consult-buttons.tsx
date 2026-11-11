"use client";

import { MessageCircle } from "lucide-react";
import { CONSULT_LINKS } from "@/lib/repositories/engagement";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.291.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
    </svg>
  );
}

export function ConsultButtons({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} data-testid="consult-buttons">
      <a
        href={CONSULT_LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="consult-whatsapp"
        className={cn(
          "inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform duration-300 hover:scale-[1.04]",
          onDark ? "bg-background text-foreground" : "bg-foreground text-background"
        )}
      >
        <MessageCircle className="h-4 w-4" /> {t("consult.whatsapp")}
      </a>
      <a
        href={CONSULT_LINKS.discord}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="consult-discord"
        className="inline-flex h-12 items-center gap-2 rounded-full bg-lime px-6 text-sm font-semibold text-lime-foreground transition-transform duration-300 hover:scale-[1.04]"
      >
        <DiscordIcon className="h-4 w-4" /> {t("consult.discord")}
      </a>
    </div>
  );
}

export function FloatingContact() {
  const { t } = useI18n();
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5" data-testid="floating-contact">
      <a
        href={CONSULT_LINKS.discord}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("consult.discord")}
        data-testid="floating-contact-discord"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-lime-foreground shadow-lg transition-transform duration-300 hover:scale-110"
      >
        <DiscordIcon className="h-5 w-5" />
      </a>
      <a
        href={CONSULT_LINKS.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t("consult.label")} — ${t("consult.whatsapp")}`}
        data-testid="floating-contact-whatsapp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform duration-300 hover:scale-110"
      >
        <WhatsAppIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
