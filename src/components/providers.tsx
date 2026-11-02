"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { LocaleProvider } from "@/lib/i18n";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { useMockDb } from "@/lib/repositories/db";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useCartStore.persist?.rehydrate?.();
    useSessionStore.persist?.rehydrate?.();
    useMockDb.persist?.rehydrate?.();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
