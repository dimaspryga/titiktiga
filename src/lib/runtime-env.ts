export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} belum dikonfigurasi`);
  return value;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

export function applicationUrl(requestUrl?: string): string {
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

export function mysqlSslEnabled(): boolean {
  return optionalEnv("MYSQL_SSL").toLowerCase() === "true";
}

export function mysqlSslRejectUnauthorized(): boolean {
  return optionalEnv("MYSQL_SSL_REJECT_UNAUTHORIZED", "true").toLowerCase() !== "false";
}
