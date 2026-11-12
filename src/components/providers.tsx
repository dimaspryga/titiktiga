"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { LocaleProvider } from "@/lib/i18n";
import { useCartStore } from "@/lib/stores/cart";
import { useSessionStore } from "@/lib/stores/session";
import { Toaster } from "sonner";
import { PageTransition } from "@/components/page-transition";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      await Promise.all([
        Promise.resolve(useCartStore.persist?.rehydrate?.()),
        Promise.resolve(useSessionStore.persist?.rehydrate?.()),
      ]);

      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!active) return;
        if (response.status === 401) {
          useSessionStore.getState().logout();
          return;
        }
        if (!response.ok) {
          console.error("Session validation failed", response.status);
          return;
        }

        const data = (await response.json()) as {
          user?: { id: string; name: string; email: string; role: "admin" | "customer" };
        };
        if (!data.user) {
          console.error("Session validation returned no user");
          return;
        }
        useSessionStore.getState().login({
          userId: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          loggedInAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Session validation request failed", error);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LocaleProvider>
          <PageTransition>{children}</PageTransition>
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
