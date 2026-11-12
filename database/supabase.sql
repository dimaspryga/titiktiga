-- ============================================================================
-- Supabase (PostgreSQL) Migration Schema for Titiktiga
-- Sumber: database/mysql.sql
-- Format: PostgreSQL DDL yang siap dijalankan di Supabase SQL Editor.
-- ============================================================================

-- Pastikan extension pgcrypto aktif untuk fungsi gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. HELPER FUNCTION: AUTO UPDATE updated_at
-- ============================================================================
-- Menggantikan fitur MySQL 'ON UPDATE CURRENT_TIMESTAMP' menggunakan trigger PostgreSQL
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. TABEL: USERS & AUTH
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone VARCHAR(30) DEFAULT '',
  email_verified_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx
  ON public.email_verification_tokens(user_id);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx
  ON public.password_reset_tokens(user_id);

-- ============================================================================
-- 3. TABEL: KATALOG PRODUK & KATEGORI
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  image_url VARCHAR(500) DEFAULT '',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category_slug VARCHAR(100) REFERENCES public.categories(slug) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL,
  discount_percent INTEGER DEFAULT NULL,
  rating NUMERIC(2, 1) DEFAULT NULL,
  detail_cover TEXT DEFAULT NULL,
  short_description JSONB NOT NULL,
  description JSONB NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS detail_cover TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS products_category_slug_idx ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);

CREATE TABLE IF NOT EXISTS public.product_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label JSONB NOT NULL,
  value VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS product_specs_product_id_idx ON public.product_specs(product_id);

-- ============================================================================
-- 4. TABEL: VOUCHER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(12, 2) NOT NULL,
  min_purchase NUMERIC(12, 2) DEFAULT 0,
  max_discount NUMERIC(12, 2) DEFAULT NULL,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  eligible_categories JSONB DEFAULT NULL
);

-- ============================================================================
-- 5. TABEL: PESANAN & PEMBAYARAN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(30) NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(30) DEFAULT '',
  address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL,
  product_discount NUMERIC(12, 2) DEFAULT 0,
  voucher_code VARCHAR(50) REFERENCES public.vouchers(code) ON DELETE SET NULL,
  voucher_discount NUMERIC(12, 2) DEFAULT 0,
  shipping_fee NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  payment_method VARCHAR(30) DEFAULT 'bank_transfer',
  payment_status VARCHAR(20) DEFAULT 'waiting'
    CHECK (payment_status IN ('waiting', 'submitted', 'approved', 'rejected')),
  payment_note TEXT,
  payment_reviewed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_voucher_code_idx ON public.orders(voucher_code);

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  slug VARCHAR(200) NOT NULL,
  name VARCHAR(200) NOT NULL,
  image_url VARCHAR(500) DEFAULT '',
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  original_unit_price NUMERIC(12, 2) DEFAULT NULL,
  discount_percent INTEGER DEFAULT NULL,
  subtotal NUMERIC(12, 2) NOT NULL
);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS original_unit_price NUMERIC(12, 2) DEFAULT NULL;
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT NULL;

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  status VARCHAR(20) DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'approved', 'rejected')),
  reviewer_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS payment_proofs_order_id_idx ON public.payment_proofs(order_id);

-- Bukti transfer disimpan di Supabase Storage agar tetap tersedia pada deployment serverless.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(100) NOT NULL,
  account_name VARCHAR(120) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 6. TABEL: LAYANAN (SERVICES) & DELIVERABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  index_label VARCHAR(10),
  title JSONB NOT NULL,
  description JSONB NOT NULL,
  price_from NUMERIC(12, 2) DEFAULT 0,
  image_url VARCHAR(500) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.service_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  label JSONB NOT NULL,
  position INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS service_deliverables_service_id_idx ON public.service_deliverables(service_id);

-- ============================================================================
-- 7. TABEL: PORTFOLIO & TESTIMONIAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) UNIQUE,
  title VARCHAR(200),
  client VARCHAR(120),
  category JSONB,
  year INTEGER,
  cover_url VARCHAR(500),
  description JSONB,
  service_tags JSONB
);

CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  url VARCHAR(500),
  position INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS portfolio_images_project_id_idx ON public.portfolio_images(project_id);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote JSONB NOT NULL,
  name VARCHAR(120),
  role JSONB,
  avatar VARCHAR(500),
  position INTEGER DEFAULT 0
);

-- ============================================================================
-- 8. TABEL: PROMOSI & KONTEN SITUS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement VARCHAR(20) NOT NULL CHECK (placement IN ('announcement', 'home-banner')),
  title JSONB NOT NULL,
  code VARCHAR(50),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.site_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS public.engagement_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS engagement_content_set_updated_at ON public.engagement_content;
CREATE TRIGGER engagement_content_set_updated_at
  BEFORE UPDATE ON public.engagement_content
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 9. SEED DATA AWAL (IDEMPOTENT / ON CONFLICT SAFE)
-- ============================================================================

INSERT INTO public.users (id, name, email, password_hash, role)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'Administrator', 'admin@titiktiga.studio',
   'sha256:ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270', 'admin'),
  ('00000000-0000-4000-8000-000000000002', 'Demo Customer', 'demo@titiktiga.studio',
   'sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'customer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.payment_accounts (id, bank_name, account_name, account_number, active)
SELECT gen_random_uuid(), 'BCA', 'Titiktiga Studio', '1234567890', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_accounts WHERE bank_name = 'BCA' AND account_number = '1234567890'
);

INSERT INTO public.payment_accounts (id, bank_name, account_name, account_number, active)
SELECT gen_random_uuid(), 'Mandiri', 'Titiktiga Studio', '0987654321', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_accounts WHERE bank_name = 'Mandiri' AND account_number = '0987654321'
);

INSERT INTO public.site_content (id, content)
VALUES (1, '{"store": {"name": "Titiktiga"}}'::JSONB)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.engagement_content (id, content)
VALUES (1, '{"consultation": {"whatsapp": "https://wa.me/6281234567890", "discord": "https://discord.gg/titiktiga"}}'::JSONB)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================
-- Mengaktifkan RLS pada seluruh tabel.
-- Akses melalui service_role (backend server / node backend) otomatis bypass RLS.
-- Public policies expose only storefront content. Sensitive data remains
-- inaccessible to anon clients and is accessed through server-side routes.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_content ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Public Read Policies (Akses publik untuk storefront)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Allow public read on product_images" ON public.product_images;
CREATE POLICY "Allow public read on product_images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on product_specs" ON public.product_specs;
CREATE POLICY "Allow public read on product_specs" ON public.product_specs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on vouchers" ON public.vouchers;
CREATE POLICY "Allow public read on vouchers" ON public.vouchers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on services" ON public.services;
CREATE POLICY "Allow public read on services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on service_deliverables" ON public.service_deliverables;
CREATE POLICY "Allow public read on service_deliverables" ON public.service_deliverables FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on portfolio_projects" ON public.portfolio_projects;
CREATE POLICY "Allow public read on portfolio_projects" ON public.portfolio_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on portfolio_images" ON public.portfolio_images;
CREATE POLICY "Allow public read on portfolio_images" ON public.portfolio_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on testimonials" ON public.testimonials;
CREATE POLICY "Allow public read on testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on promotions" ON public.promotions;
CREATE POLICY "Allow public read on promotions" ON public.promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on site_content" ON public.site_content;
CREATE POLICY "Allow public read on site_content" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on payment_accounts" ON public.payment_accounts;

DROP POLICY IF EXISTS "Allow public read on engagement_content" ON public.engagement_content;
CREATE POLICY "Allow public read on engagement_content" ON public.engagement_content FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- Sensitive records are accessed through authenticated server routes only.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert on payment_proofs" ON public.payment_proofs;
DROP POLICY IF EXISTS "Allow public read on payment_proofs" ON public.payment_proofs;

-- ----------------------------------------------------------------------------
-- Users & Auth Tokens Policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public insert on users" ON public.users;
DROP POLICY IF EXISTS "Allow public read on users" ON public.users;
DROP POLICY IF EXISTS "Allow public update on users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert on email_verification_tokens" ON public.email_verification_tokens;
DROP POLICY IF EXISTS "Allow public read on email_verification_tokens" ON public.email_verification_tokens;
DROP POLICY IF EXISTS "Allow public update on email_verification_tokens" ON public.email_verification_tokens;
DROP POLICY IF EXISTS "Allow public insert on password_reset_tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Allow public read on password_reset_tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Allow public update on password_reset_tokens" ON public.password_reset_tokens;
