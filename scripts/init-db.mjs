import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ipyfobhccfdgrfioscji.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!key) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum dikonfigurasi di .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log(`Menghubungkan ke Supabase di: ${url}...`);

  const tables = [
    "users",
    "categories",
    "products",
    "vouchers",
    "orders",
    "services",
    "portfolio_projects",
    "testimonials",
    "promotions",
    "site_content",
    "payment_accounts",
    "engagement_content",
  ];

  let successCount = 0;
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.warn(`  [!] Tabel '${table}': ${error.message}`);
    } else {
      console.log(`  [OK] Tabel '${table}' aktif (jumlah data: ${count ?? 0})`);
      successCount++;
    }
  }

  console.log(`\nVerifikasi selesai: ${successCount}/${tables.length} tabel siap digunakan di Supabase.`);
}

main().catch((err) => {
  console.error("Inisialisasi database Supabase gagal:", err);
  process.exit(1);
});
