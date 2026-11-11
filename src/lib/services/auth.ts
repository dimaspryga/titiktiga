import type { MockUser, Session } from "@/lib/types";

const HASH_PREFIX = "sha256:";

export async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return HASH_PREFIX + hex;
}

export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return hashPassword(password).then((h) => h === storedHash);
}

export function sessionFromUser(user: MockUser): Session {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    loggedInAt: new Date().toISOString(),
  };
}

export type AuthResult =
  | { session: Session; pendingVerification?: undefined; error?: undefined }
  | { session?: undefined; pendingVerification: true; email: string; error?: undefined }
  | { session?: undefined; pendingVerification?: undefined; error: string };

/** Nama lama dipertahankan agar halaman login/register tidak perlu diubah. */
export const mockAuthAdapter = {
  async login(email: string, password: string): Promise<AuthResult> {
    const passwordHash = await hashPassword(password);
    let response: Response;
    try {
      response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), passwordHash }),
      });
    } catch {
      return { error: "auth.error.network" };
    }
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.user) return { error: data?.error ?? "auth.error.invalid" };
    return { session: sessionFromUser(data.user) };
  },

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const passwordHash = await hashPassword(password);
    let response: Response;
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, passwordHash }),
      });
    } catch {
      return { error: "auth.error.network" };
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) return { error: data?.error ?? "auth.error.exists" };
    if (data?.pendingVerification) return { pendingVerification: true, email: data.email };
    if (!data?.user) return { error: "auth.error.exists" };
    return { session: sessionFromUser(data.user) };
  },

  async requestPasswordReset(email: string, newPassword: string): Promise<boolean> {
    let response: Response;
    try {
      response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passwordHash: await hashPassword(newPassword) }),
      });
    } catch {
      return false;
    }
    const data = await response.json().catch(() => null);
    return response.ok && Boolean(data?.requested);
  },
};
