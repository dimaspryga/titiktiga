export type Intent =
  | { type: "add-to-cart"; productId: string; quantity: number }
  | { type: "buy-now"; productId: string; quantity: number };

const INTENT_KEY = "titiktiga.intent";

export function saveIntent(intent: Intent): void {
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  } catch {
    /* demo persistence unavailable */
  }
}

export function consumeIntent(): Intent | null {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(INTENT_KEY);
    const parsed = JSON.parse(raw) as Intent;
    if (parsed && (parsed.type === "add-to-cart" || parsed.type === "buy-now") && parsed.productId) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Memvalidasi callback/return URL agar hanya mengizinkan path internal
 * (diawali '/', bukan '//', tanpa backslash atau skema eksternal).
 */
export function sanitizeReturnPath(raw?: string | null, fallback = "/"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback;
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(raw.slice(1))) return fallback;
  return raw;
}

export function loginUrl(returnTo: string): string {
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}
