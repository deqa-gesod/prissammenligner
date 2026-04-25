"use server"

import sql from "./db"

// Server action — henter full produktinfo (alle butikker, siste pris) for IDene
// kurven inneholder. Kalles fra klient-komponenter etter localStorage er lest.
export async function getCartProducts(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const cleanIds = ids
    .map(n => Number.parseInt(n, 10))
    .filter(Number.isFinite)
  if (cleanIds.length === 0) return []

  const rows = await sql`
    SELECT
      p.id,
      p.name_norm,
      p.category,
      json_agg(
        json_build_object(
          'store_slug', s.slug,
          'store_name', s.name,
          'name_raw', r.name_raw,
          'price', r.price::float,
          'price_per_unit', r.price_per_unit::float,
          'campaign_price', r.campaign_price::float,
          'campaign_text', r.campaign_text,
          'url', r.url,
          'unit', r.unit,
          'size', r.size::float
        ) ORDER BY s.slug
      ) AS listings
    FROM product p
    JOIN (
      SELECT DISTINCT ON (l.product_id, l.store_id)
        l.product_id, l.store_id, l.name_raw, l.url, l.unit, l.size,
        ps.price, ps.price_per_unit, ps.campaign_price, ps.campaign_text
      FROM listing l
      CROSS JOIN LATERAL (
        SELECT price, price_per_unit, campaign_price, campaign_text
        FROM price_snapshot
        WHERE listing_id = l.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) ps
      ORDER BY l.product_id, l.store_id, l.last_seen_at DESC NULLS LAST, l.id
    ) r ON r.product_id = p.id
    JOIN store s ON s.id = r.store_id
    WHERE p.id = ANY(${cleanIds})
    GROUP BY p.id
  `
  return rows
}
