// Hardkodet mock for design-sammenligning. Erstattes med DB-data i Fase 7.

export const stores = [
  { slug: "oda", name: "Oda", color: "#D9A5A5" },
  { slug: "meny", name: "Meny", color: "#C9B8DD" },
  { slug: "spar", name: "Spar", color: "#A8C9A3" },
]

export const categories = [
  { slug: "meieri", name: "Meieri", emoji: "🥛", count: 42 },
  { slug: "frukt-gront", name: "Frukt & grønt", emoji: "🍎", count: 68 },
  { slug: "kjott-fisk", name: "Kjøtt & fisk", emoji: "🥩", count: 35 },
  { slug: "brod-bakeri", name: "Brød & bakeri", emoji: "🥐", count: 24 },
  { slug: "drikke", name: "Drikke", emoji: "🧃", count: 51 },
  { slug: "snacks", name: "Snacks & godteri", emoji: "🍫", count: 47 },
]

export const mockProducts = [
  {
    id: 1,
    name: "Tine Lettmelk",
    size: "1,75 l",
    meta: "0,5% fett",
    emoji: "🥛",
    category: "meieri",
    prices: {
      oda: { price: 24.90, campaign: null },
      meny: { price: 26.50, campaign: null },
      spar: { price: 25.00, campaign: null },
    },
    pricePerUnit: "24,90/L",
  },
  {
    id: 2,
    name: "Q Melk",
    size: "1 l",
    meta: "Skummet",
    emoji: "🥛",
    category: "meieri",
    prices: {
      oda: { price: 22.00, campaign: { price: 17.60, text: "-20% TILBUD" } },
      meny: null,
      spar: { price: 23.50, campaign: null },
    },
    pricePerUnit: "17,60/L",
  },
  {
    id: 3,
    name: "Jarlsberg Original",
    size: "700 g",
    meta: "Skivet",
    emoji: "🧀",
    category: "meieri",
    prices: {
      oda: null,
      meny: { price: 89.00, campaign: null },
      spar: { price: 92.00, campaign: null },
    },
    pricePerUnit: "127,-/kg",
  },
  {
    id: 4,
    name: "Tine YT Protein",
    size: "430 g",
    meta: "Jordbær",
    emoji: "🥣",
    category: "meieri",
    prices: {
      oda: { price: 38.90, campaign: null },
      meny: { price: 39.90, campaign: null },
      spar: { price: 37.50, campaign: { price: 29.90, text: "-25%" } },
    },
    pricePerUnit: "69,53/kg",
  },
  {
    id: 5,
    name: "Synnøve Kremost",
    size: "200 g",
    meta: "Naturell",
    emoji: "🧀",
    category: "meieri",
    prices: {
      oda: { price: 34.50, campaign: null },
      meny: { price: 34.50, campaign: null },
      spar: { price: 36.00, campaign: null },
    },
    pricePerUnit: "172,-/kg",
  },
  {
    id: 6,
    name: "Kviteseid Økologisk Smør",
    size: "250 g",
    meta: "Usaltet",
    emoji: "🧈",
    category: "meieri",
    prices: {
      oda: { price: 49.90, campaign: null },
      meny: null,
      spar: null,
    },
    pricePerUnit: "199,60/kg",
  },
  // Andre kategorier (for tilbud-siden og søk)
  {
    id: 7,
    name: "Gilde Kyllingfilet",
    size: "800 g",
    meta: "Naturell",
    emoji: "🍗",
    category: "kjott-fisk",
    prices: {
      oda: { price: 129.00, campaign: { price: 89.00, text: "-31%" } },
      meny: { price: 135.00, campaign: null },
      spar: { price: 132.00, campaign: null },
    },
    pricePerUnit: "111,25/kg",
  },
  {
    id: 8,
    name: "Eple Pink Lady",
    size: "1 kg",
    meta: "Klasse 1",
    emoji: "🍎",
    category: "frukt-gront",
    prices: {
      oda: { price: 39.90, campaign: null },
      meny: { price: 42.00, campaign: { price: 29.90, text: "-29%" } },
      spar: { price: 41.50, campaign: null },
    },
    pricePerUnit: "29,90/kg",
  },
  {
    id: 9,
    name: "Bjørklund Kvikk Lunsj",
    size: "47 g",
    meta: "Klassisk",
    emoji: "🍫",
    category: "snacks",
    prices: {
      oda: { price: 18.90, campaign: null },
      meny: { price: 19.50, campaign: null },
      spar: { price: 14.90, campaign: { price: 9.90, text: "-34%" } },
    },
    pricePerUnit: "211,-/kg",
  },
  {
    id: 10,
    name: "Bonaqua Sitron",
    size: "1,5 l",
    meta: "Kullsyre",
    emoji: "🧃",
    category: "drikke",
    prices: {
      oda: { price: 25.90, campaign: null },
      meny: { price: 24.90, campaign: null },
      spar: { price: 22.90, campaign: null },
    },
    pricePerUnit: "15,27/L",
  },
]

export function cheapestStore(product) {
  let min = null
  for (const store of stores) {
    const p = product.prices[store.slug]
    if (!p) continue
    const effective = p.campaign ? p.campaign.price : p.price
    if (min === null || effective < min.price) {
      min = { slug: store.slug, price: effective }
    }
  }
  return min
}

export function storesCarrying(product) {
  return stores.filter(s => product.prices[s.slug] !== null)
}

export function discountPercent(product) {
  let max = 0
  for (const store of stores) {
    const p = product.prices[store.slug]
    if (!p?.campaign) continue
    const pct = Math.round((1 - p.campaign.price / p.price) * 100)
    if (pct > max) max = pct
  }
  return max
}

// Produkter med aktiv kampanje, sortert etter størst rabatt
export function campaignProducts() {
  return mockProducts
    .filter(p => stores.some(s => p.prices[s.slug]?.campaign))
    .sort((a, b) => discountPercent(b) - discountPercent(a))
}

// Fake prishistorikk for produkt-detalj (30 dager)
export function priceHistory(productId) {
  const seed = productId * 17
  const days = 30
  const base = { oda: 25, meny: 27, spar: 26 }
  const history = []
  for (let i = days; i >= 0; i--) {
    const noise = n => 1 + Math.sin((seed + i) * n) * 0.08
    const date = new Date()
    date.setDate(date.getDate() - i)
    history.push({
      date: date.toISOString().slice(0, 10),
      oda: +(base.oda * noise(0.3)).toFixed(2),
      meny: +(base.meny * noise(0.5)).toFixed(2),
      spar: +(base.spar * noise(0.7)).toFixed(2),
    })
  }
  return history
}

// Handleliste-eksempel (3 produkter i kurven)
export const mockCart = [
  { productId: 1, quantity: 2 },
  { productId: 4, quantity: 1 },
  { productId: 8, quantity: 3 },
]

export function cartTotals(cart) {
  const totals = { oda: 0, meny: 0, spar: 0 }
  const missing = { oda: 0, meny: 0, spar: 0 }
  for (const item of cart) {
    const product = mockProducts.find(p => p.id === item.productId)
    if (!product) continue
    for (const store of stores) {
      const p = product.prices[store.slug]
      if (!p) {
        missing[store.slug] += 1
        continue
      }
      const price = p.campaign ? p.campaign.price : p.price
      totals[store.slug] += price * item.quantity
    }
  }
  return { totals, missing }
}
