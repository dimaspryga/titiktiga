import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Session } from "@/lib/types";

interface SessionState {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
}

/** Client-side session cache for UI state; API access is authorized by the server cookie. */
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
