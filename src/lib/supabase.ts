import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "@/lib/runtime-env";

let cachedClient: SupabaseClient | null = null;
let appliedKey = "";

export function getCleanSupabaseUrl(): string {
  const raw = supabaseUrl();
  return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function getSupabase(): SupabaseClient {
  const url = getCleanSupabaseUrl();
  const key = supabaseServiceRoleKey() || supabaseAnonKey() || "";

  if (cachedClient && appliedKey === key && key !== "") {
    return cachedClient;
  }

  appliedKey = key;
  cachedClient = createClient(url, key || "placeholder-anon-key", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export default supabase;

