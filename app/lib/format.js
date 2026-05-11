export function formatKr(n) {
  return n.toFixed(2).replace(".", ",")
}

export function formatSize(listing) {
  if (!listing.size) return ""
  const size = Number.isInteger(listing.size)
    ? listing.size
    : listing.size.toString().replace(".", ",")
  return listing.unit ? `${size} ${listing.unit}` : `${size}`
}

export function formatPricePerUnit(listing) {
  if (!listing?.price_per_unit) return ""
  const unit = listing.unit?.toLowerCase()
  const perUnit = unit === "g" ? "kg" : unit === "ml" ? "l" : unit
  return `${formatKr(listing.price_per_unit)}/${perUnit ?? ""}`
}

export function hasCampaign(listing) {
  return (
    listing.campaign_price != null &&
    listing.price != null &&
    listing.campaign_price < listing.price
  )
}

export function effectivePrice(listing) {
  return hasCampaign(listing) ? listing.campaign_price : listing.price
}

export function discountPercent(product) {
  let max = 0
  for (const l of product.listings) {
    if (!hasCampaign(l)) continue
    const pct = Math.round((1 - l.campaign_price / l.price) * 100)
    if (pct > max) max = pct
  }
  return max
}

export function cheapestListing(product) {
  let min = null
  for (const l of product.listings) {
    const effective = effectivePrice(l)
    if (min === null || effective < min.effective) {
      min = { store_slug: l.store_slug, effective }
    }
  }
  return min
}

export function unitPrice(listing) {
  const eff = effectivePrice(listing)
  if (listing.price_per_unit != null) {
    // price_per_unit i DB er basert på vanlig pris, så juster for kampanje
    if (hasCampaign(listing)) {
      return listing.price_per_unit * (listing.campaign_price / listing.price)
    }
    return listing.price_per_unit
  }
  // Fallback: regn ut fra size + unit (ml→l og g→kg)
  if (!listing.size || !listing.unit) return eff
  const u = listing.unit.toLowerCase()
  const sizeNorm = u === "ml" || u === "g" ? listing.size / 1000 : listing.size
  if (!sizeNorm) return eff
  return eff / sizeNorm
}

export function cheapestUnitPrice(product) {
  let min = Infinity
  for (const l of product.listings) {
    const ppu = unitPrice(l)
    if (ppu < min) min = ppu
  }
  return min
}

export function displayName(product) {
  return product.listings?.[0]?.name_raw || product.name_norm || product.name
}
