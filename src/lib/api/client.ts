/**
 * API client abstraction — siap dipakai ketika backend tersedia.
 * Base URL dibaca dari NEXT_PUBLIC_API_BASE_URL. Jika belum dikonfigurasi,
 * aplikasi tetap berjalan penuh menggunakan mock repository.
 */

export class ApiError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl() !== "";
}

export function normalizeError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof Error) return new ApiError(e.message, "network_error");
  return new ApiError("Terjadi kesalahan tak terduga", "unknown_error");
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("API belum dikonfigurasi — aplikasi berjalan dengan data demo.", "mock/unconfigured");
  }
  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new ApiError(`HTTP ${res.status}`, `http_${res.status}`, res.status);
    }
    return (await res.json()) as T;
  } catch (e) {
    throw normalizeError(e);
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
