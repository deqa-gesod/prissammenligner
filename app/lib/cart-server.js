"use server"

import sql from "./db"
import { groupByProduct } from "./queries"

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
      p.id AS product_id,
      p.name_norm,
      p.category,
      l.name_raw,
      l.size::float AS size,
      l.unit,
      l.url,
      s.slug AS store_slug,
      s.name AS store_name,
      ps.price::float AS price,
      ps.price_per_unit::float AS price_per_unit,
      ps.campaign_price::float AS campaign_price,
      ps.campaign_text
    FROM listing l
    JOIN product p ON p.id = l.product_id
    JOIN store s ON s.id = l.store_id
    JOIN price_snapshot ps ON ps.listing_id = l.id
    WHERE p.id = ANY(${cleanIds})
      AND ps.scraped_at = (
        SELECT MAX(scraped_at) FROM price_snapshot WHERE listing_id = l.id
      )
  `
  return groupByProduct(rows)
}
