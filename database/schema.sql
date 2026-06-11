-- =============================================================
-- Justice Georgenes Admin Dashboard — Supabase Database Schema
-- Run this SQL in your Supabase project's SQL Editor
-- =============================================================

-- Enable UUID extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- PRODUCTS
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category      TEXT,
  image_url     TEXT,
  image_path    TEXT,
  stock         INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  slug          TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- PROJECTS
-- =============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  client_name   TEXT,
  location      TEXT,
  image_url     TEXT,
  image_path    TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  start_date    DATE,
  end_date      DATE,
  slug          TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  items           JSONB NOT NULL DEFAULT '[]',
  total_amount    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes           TEXT,
  shipping_address JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- LEADS
-- =============================================================
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT,
  source      TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- SETTINGS (key-value store)
-- =============================================================
CREATE TABLE IF NOT EXISTS settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  value       JSONB,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- Only authenticated users (admins) can access all tables
-- =============================================================
ALTER TABLE products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings  ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read/write
CREATE POLICY "Authenticated read products"  ON products  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write products" ON products  FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read projects"  ON projects  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write projects" ON projects  FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read orders"    ON orders    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write orders"   ON orders    FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read leads"     ON leads     FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write leads"    ON leads     FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read settings"  ON settings  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write settings" ON settings  FOR ALL    USING (auth.role() = 'authenticated');

-- =============================================================
-- STORAGE BUCKETS
-- Run these in the Supabase Storage section or via SQL
-- =============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
--   ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true)
--   ON CONFLICT DO NOTHING;

-- =============================================================
-- SEED: Default settings
-- =============================================================
INSERT INTO settings (key, value, description) VALUES
  ('site_name',        '"Justice Georgenes"',  'Public site name'),
  ('contact_email',    '"info@example.com"',    'Primary contact email'),
  ('currency',         '"USD"',                 'Store currency')
ON CONFLICT (key) DO NOTHING;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT;
