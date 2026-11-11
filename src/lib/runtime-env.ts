export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} belum dikonfigurasi`);
  return value;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

export function applicationUrl(requestUrl?: string, requestHeaders?: Headers): string {
  const forwardedHost = requestHeaders?.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders?.get("host")?.trim();
  const forwardedProto = requestHeaders?.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (host && !["0.0.0.0", "::", "[::]"].includes(host.split(":")[0])) {
    const protocol = forwardedProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${protocol}://${host}`;
  }

  const configured = optionalEnv("APP_URL");
  if (configured) return configured.replace(/\/+$/, "");

  const productionUrl = optionalEnv("VERCEL_PROJECT_PRODUCTION_URL");
  if (productionUrl) return `https://${productionUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  const deploymentUrl = optionalEnv("VERCEL_URL");
  if (deploymentUrl) return `https://${deploymentUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  if (requestUrl) {
    const url = new URL(requestUrl);
    return url.origin;
  }

  return "http://localhost:3000";
}

export function supabaseUrl(): string {
  return optionalEnv("SUPABASE_URL", optionalEnv("NEXT_PUBLIC_SUPABASE_URL", "https://ipyfobhccfdgrfioscji.supabase.co"));
}

export function supabaseAnonKey(): string {
  return optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function supabaseServiceRoleKey(): string {
  return optionalEnv("SUPABASE_SERVICE_ROLE_KEY", optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function midtransClientKey(): string {
  return optionalEnv("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY");
}

export function midtransServerKey(): string {
  return optionalEnv("MIDTRANS_SERVER_KEY");
}

export function midtransIsProduction(): boolean {
  return optionalEnv("MIDTRANS_IS_PRODUCTION", "false").toLowerCase() === "true";
}

export function midtransSnapUrl(): string {
  return midtransIsProduction()
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

export function midtransApiBaseUrl(): string {
  return midtransIsProduction()
    ? "https://app.midtrans.com/snap/v1"
    : "https://app.sandbox.midtrans.com/snap/v1";
}
