# Titiktiga — Creative Studio Profile & E-Commerce (Next.js)

Company profile + storefront + admin dashboard untuk studio kreatif **Titiktiga**.
Frontend Next.js terhubung ke REST API lokal yang didukung oleh database Supabase (PostgreSQL).

## Supabase + REST API

1. Jalankan skema database lengkap di Supabase SQL Editor menggunakan file:
   ```bash
   database/supabase.sql
   ```
2. Konfigurasikan kredensial Supabase di `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Jalankan aplikasi. API Next.js tersedia di `/api/*` dan data produk, pesanan, voucher, serta konten disimpan di Supabase.
4. Verifikasi koneksi dan tabel Supabase:
   ```bash
   npm run db:init
   ```
5. Checkout transfer bank menerima screenshot bukti transfer (JPG/PNG/WebP, maks. 5 MB). File disimpan di bucket `payment-proofs` Supabase Storage dan catatannya disimpan di database untuk ditinjau admin. Pastikan `SUPABASE_SERVICE_ROLE_KEY` tersedia di server, lalu jalankan skema database terbaru agar bucket dibuat.
6. Atur kredensial SMTP dan `APP_URL` di `.env.local` untuk email verifikasi akun dan reset kata sandi. Tautan reset kata sandi berlaku selama 1 jam.
7. Media produk mendukung gambar JPG/PNG/WebP (maks. 5 MB) dan video MP4/WebM/MOV/OGG (maks. 30 MB). Jalankan skema database terkini agar tabel `password_reset_tokens` tersedia.
8. Jalankan skema database terkini setelah pembaruan order agar harga asli dan diskon tiap item tersimpan; pesanan lama hanya memiliki total diskon dan tidak dapat menampilkan harga asli per item secara akurat.
9. Jalankan skema database terkini setelah pembaruan katalog agar kolom `products.detail_cover` tersedia untuk sampul khusus halaman detail. Media konten pertama tetap dipakai pada kartu/katalog.

## Menjalankan Aplikasi

```bash
yarn install
yarn start        # Next.js dev server di port 3000 (dipakai supervisor platform)
yarn build        # production build
yarn test         # vitest (unit test: pricing, voucher, cart, safe redirect)
yarn lint         # eslint (next/core-web-vitals)
npx tsc --noEmit  # typecheck strict
```

## Akun Demo (mock — bukan autentikasi produksi)

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@titiktiga.studio` | `admin1234` |
| Pelanggan | `demo@titiktiga.studio` | `demo1234` |

Registrasi terbuka untuk membuat akun pelanggan demo baru.

## Route yang Tersedia

**Publik (Flow A):** `/` · `/about` · `/services` · `/portfolio` · `/portfolio/[slug]` · `/contact` · `/products` · `/products/[slug]` · `/categories/[slug]`

**Auth (Flow C):** `/login` · `/register` · `/forgot-password` (semuanya adapter mock)

**Belanja (Flow B/D):** `/cart` · `/checkout` · `/checkout/success?number=TT-…`

**Akun:** `/account` · `/orders`

**Admin (Flow E, guard demo peran admin):** `/admin/dashboard` · `/admin/products` (+`/new`, `/[id]/edit`) · `/admin/categories` · `/admin/orders` · `/admin/customers` · `/admin/vouchers` · `/admin/promotions` · `/admin/content` · `/admin/settings`

## Arsitektur

```
src/
├── app/                    # Next.js App Router — route groups: (marketing) (store) (auth) (account) (admin)
├── components/             # Presentational components (motion, header/footer, admin UI)
├── lib/
│   ├── types.ts            # Tipe domain (Product, CartItem, Voucher, Order, SiteContent, …)
│   ├── i18n.tsx            # LocaleProvider ID/EN + dictionary UI
│   ├── mock/               # Seed data (products, catalog, content) — sumber data demo
│   ├── repositories/       # Kontrak repository + implementasi mock (localStorage via Zustand persist)
│   ├── services/           # Pricing/voucher/cart calc (pure), auth adapter, safe redirect & intent
│   ├── validation/         # Skema Zod untuk semua form
│   ├── stores/             # Zustand: cart & session (persist, skipHydration)
│   ├── hooks.ts            # SWR hooks di atas repository + revalidateAll
│   └── api/client.ts       # Abstraksi API client (NEXT_PUBLIC_API_BASE_URL) — siap backend
└── tests/                  # Vitest: pricing, voucher repo, cart store, sanitizeReturnPath
```

**Alur data:** komponen → SWR hook → repository interface → mock repo (Zustand store yang dipersist ke `localStorage`, key `titiktiga.db.v1`). CRUD admin menulis ke store yang sama sehingga perubahan langsung tampil di storefront. Tidak ada mock array yang dibaca langsung oleh komponen UI.

**Persistence demo:** data + keranjang + sesi tersimpan di `localStorage`/`sessionStorage` browser. Reset total tersedia di `/admin/settings`. Menghapus storage browser mengembalikan seed awal.

## Keamanan — Batasan Demo (Penting)

- Mock auth **bukan** autentikasi produksi: kredensial dicek di klien (hash SHA-256 di localStorage). Jangan pakai password asli.
- Password tidak pernah disimpan sebagai teks polos di storage; token/session buatan **tidak** dianggap proteksi produksi.
- Role dibaca dari client hanya untuk **guard navigasi demo**; otorisasi nyata harus di server untuk setiap resource.
- `sanitizeReturnPath` memvalidasi `returnTo` agar hanya path internal (menolak `//`, `https:`, backslash, karakter kontrol).
- Harga & voucher dihitung ulang dari repository — kalkulasi demo, tetap harus diverifikasi ulang server saat produksi.
- Untuk produksi: session cookie **HttpOnly + Secure + SameSite**, otorisasi server, dan repository diganti API tanpa mengubah komponen (kontrak repository tetap).

## Titik Integrasi Backend di Masa Depan

1. Set `NEXT_PUBLIC_API_BASE_URL` di `.env`.
2. Implementasikan ulang `src/lib/repositories/*` (kontrak interface sudah ada) memanggil `src/lib/api/client.ts`.
3. Ganti `mockAuthAdapter` dengan adapter session server (cookie HttpOnly).
4. Sketch tema, tipe, form Zod, dan pricing service dapat dipakai ulang tanpa perubahan.

## Fitur Bahasa & Tema

- Toggle **ID/EN** di header (UI dictionary + konten mock bilingual `{id, en}`); pesan validasi form dalam Bahasa Indonesia.
- Mode **terang/gelap** via `next-themes` (mengikuti sistem secara default).
- Motion: Lenis smooth scroll, reveal on-scroll, marquee, magnetic button, count-up — semuanya menghormati `prefers-reduced-motion`.

## Catatan Testing

- `yarn test` — unit test pricing/voucher/cart/redirect (vitest).
- Verifikasi manual: alur Add to Cart/Buy Now saat belum login (intended action dipertahankan, tidak ada duplikasi), voucher (TITIK20/HEMAT50K/POSTER10/LAMACOMBO), filter & Load More di `/products`, CRUD admin.
