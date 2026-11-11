"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query-client";
import { LocaleProvider } from "@/lib/i18n";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { useMockDb } from "@/lib/repositories/db";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  useEffect(() => {
    useCartStore.persist?.rehydrate?.();
    useSessionStore.persist?.rehydrate?.();
    useMockDb.persist?.rehydrate?.();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LocaleProvider>
          {children}
          <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              className: "rounded-none border border-border bg-card font-sans text-foreground shadow-2xl",
              style: { borderRadius: "0", borderColor: "hsl(var(--border))" },
            }}
          />
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
