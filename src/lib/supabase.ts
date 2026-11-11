import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "@/lib/runtime-env";

let cachedClient: SupabaseClient | null = null;

export function getCleanSupabaseUrl(): string {
  const raw = supabaseUrl();
  return raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = getCleanSupabaseUrl();
  const key = supabaseServiceRoleKey() || supabaseAnonKey() || "placeholder-anon-key";

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

export const supabase = getSupabase();
export default supabase;

