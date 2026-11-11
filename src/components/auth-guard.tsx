"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useSessionStore } from "@/lib/stores/session";
import { loginUrl, sanitizeReturnPath } from "@/lib/services/intent";
import type { Role } from "@/lib/types";

/**
 * Menunggu rehidrasi persist store di klien. Aman untuk SSR:
 * api.persist hanya ada di browser (localStorage tersedia).
 */
function useSessionHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = (useSessionStore as unknown as { persist?: { hasHydrated?: () => boolean; onFinishHydration?: (cb: () => void) => () => void; rehydrate?: () => Promise<void> | void } }).persist;
    if (persist?.hasHydrated?.()) {
      setHydrated(true);
      return;
    }
    if (persist?.onFinishHydration) {
      const unsub = persist.onFinishHydration(() => setHydrated(true));
      if (persist.hasHydrated?.()) setHydrated(true);
      return unsub;
    }
    if (persist?.rehydrate) {
      void Promise.resolve(persist.rehydrate()).then(() => setHydrated(true));
      return;
    }
    const timer = setTimeout(() => setHydrated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return hydrated;
}

/**
 * Route guard DEMO (navigasi klien). Bukan pengganti otorisasi server:
 * pada produksi, setiap resource harus divalidasi di server.
 */
export function RequireAuth({
  children,
  role,
  returnTo,
}: {
  children: React.ReactNode;
  role?: Role;
  returnTo?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const hydrated = useSessionHydrated();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const target = sanitizeReturnPath(returnTo) || window.location.pathname;
    if (!session) {
      toast.warning("Login diperlukan untuk membuka halaman ini.", {
        description: "Anda akan diarahkan ke halaman login.",
      });
      router.replace(loginUrl(target));
      return;
    }
    if (role && session.role !== role) {
      toast.error("Akses ditolak.", {
        description: "Halaman ini hanya tersedia untuk administrator.",
      });
      router.replace("/account");
      return;
    }
    setAllowed(true);
  }, [hydrated, session, role, returnTo, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" data-testid="auth-guard-loading">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return <>{children}</>;
}
