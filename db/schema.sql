-- Prissammenligner: Postgres-skjema
-- Kjør dette i Supabase → SQL Editor én gang. Tabellene er tomme etter opprettelse.

CREATE TABLE IF NOT EXISTS store (
  id    SERIAL PRIMARY KEY,
  slug  TEXT UNIQUE NOT NULL,
  name  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product (
  id          SERIAL PRIMARY KEY,
  gtin        TEXT,
  name_norm   TEXT NOT NULL,
  category    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_name_norm ON product(name_norm);
CREATE INDEX IF NOT EXISTS idx_product_gtin      ON product(gtin) WHERE gtin IS NOT NULL;

CREATE TABLE IF NOT EXISTS listing (
  id            SERIAL PRIMARY KEY,
  product_id    INT REFERENCES product(id) ON DELETE CASCADE,
  store_id      INT REFERENCES store(id)   ON DELETE CASCADE,
  store_sku     TEXT NOT NULL,
  name_raw      TEXT NOT NULL,
  url           TEXT,
  image_url     TEXT,
  unit          TEXT,
  size          NUMERIC,
  last_seen_at  TIMESTAMPTZ,
  UNIQUE (store_id, store_sku)
);

CREATE INDEX IF NOT EXISTS idx_listing_product ON listing(product_id);

CREATE TABLE IF NOT EXISTS price_snapshot (
  id              BIGSERIAL PRIMARY KEY,
  listing_id      INT REFERENCES listing(id) ON DELETE CASCADE,
  price           NUMERIC(10,2) NOT NULL,
  price_per_unit  NUMERIC(10,2),
  campaign_price  NUMERIC(10,2),
  campaign_text   TEXT,
  scraped_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshot_listing_time ON price_snapshot(listing_id, scraped_at DESC);

INSERT INTO store (slug, name) VALUES
  ('oda',  'Oda'),
  ('meny', 'Meny'),
  ('spar', 'Spar')
ON CONFLICT (slug) DO NOTHING;
