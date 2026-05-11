// Tar flate rader fra DB og grupperer på produkt-id, så hvert produkt får
// en listings-array med en oppføring per butikk.
export function groupByProduct(rows) {
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.product_id)) {
      map.set(r.product_id, {
        id: r.product_id,
        name_norm: r.name_norm,
        category: r.category,
        listings: [],
      })
    }
    const product = map.get(r.product_id)
    // Samme produkt kan ha flere listing-rader per butikk (gamle URL-er etc).
    // Vi vil bare ha én listing per butikk, så hopp over hvis vi allerede har en.
    if (product.listings.some(l => l.store_slug === r.store_slug)) continue
    product.listings.push({
      store_slug: r.store_slug,
      store_name: r.store_name,
      name_raw: r.name_raw,
      price: r.price,
      campaign_price: r.campaign_price,
      campaign_text: r.campaign_text,
      price_per_unit: r.price_per_unit,
      url: r.url,
      unit: r.unit,
      size: r.size,
    })
  }
  // Sorter listings per butikk-slug så rekkefølgen blir lik på alle sider
  for (const p of map.values()) {
    p.listings.sort((a, b) => a.store_slug.localeCompare(b.store_slug))
  }
  return [...map.values()]
}
