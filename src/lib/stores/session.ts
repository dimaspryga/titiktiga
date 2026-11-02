import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Session } from "@/lib/types";

interface SessionState {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
}

/**
 * DEMO ONLY — session mock di localStorage. Pada produksi gunakan
 * cookie HttpOnly + Secure + SameSite yang diterbitkan server.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
    }),
    {
      name: "titiktiga.session.v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
