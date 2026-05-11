"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { stores } from "../../lib/stores"
import { categories } from "../../lib/categories"
import {
  formatKr,
  effectivePrice,
  hasCampaign,
  displayName,
} from "../../lib/format"
import { readCart } from "../../lib/cart"
import { getCartProducts } from "../../lib/cart-server"

// useSearchParams krever Suspense rundt seg i Next.js, derfor wrapper jeg her.
export default function KjopPage() {
  return (
    <Suspense>
      <KjopContent />
    </Suspense>
  )
}

function KjopContent() {
  const params = useSearchParams()
  const storeParam = params.get("store")

  const [cart, setCart] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const items = readCart()
      if (items.length === 0) {
        setCart(items)
        setProducts([])
        setLoading(false)
        return
      }
      const rows = await getCartProducts(items.map(i => i.productId))
      setCart(items)
      setProducts(rows)
      setLoading(false)
    }
    load()
  }, [])

  const validCart = (cart ?? []).filter(item =>
    products.some(p => p.id === item.productId)
  )
  const totals = computeTotals(validCart, products)
  const cheapestSlug = findCheapestStore(totals)

  function isFullyMissing(slug) {
    return totals.missing[slug] === validCart.length
  }
  const paramValid =
    stores.some(s => s.slug === storeParam) && !isFullyMissing(storeParam)
  const selectedSlug = paramValid ? storeParam : cheapestSlug
  const selected = stores.find(s => s.slug === selectedSlug)
  const otherStores = stores
    .filter(s => s.slug !== selectedSlug && !isFullyMissing(s.slug))
    .sort((a, b) => totals.totals[a.slug] - totals.totals[b.slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <div className="rounded-xl border border-rose-mist bg-blush-50 p-10 animate-pulse">
          <div className="h-8 w-2/3 mx-auto bg-rose-mist/60 rounded mb-4" />
          <div className="h-4 w-1/2 mx-auto bg-rose-mist/60 rounded" />
        </div>
      </div>
    )
  }

  if (validCart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <section
          className="rounded-xl border border-rose-mist bg-blush-50 py-20 px-6 text-center"
          style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
        >
          <div className="text-6xl mb-6 text-rose-dusty" aria-hidden>✿</div>
          <h2 className="font-serif italic text-3xl text-ink mb-4">
            Ingen produkter å handle
          </h2>
          <p className="text-mocha text-sm max-w-md mx-auto mb-8">
            Handlelista er tom. Legg til produkter først.
          </p>
          <Link
            href="/kategori/melk"
            className="inline-block rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
          >
            Utforsk produkter
          </Link>
        </section>
      </div>
    )
  }

  const selectedTotal = totals.totals[selectedSlug]
  const isCheapest = selectedSlug === cheapestSlug
  const missingHere = totals.missing[selectedSlug]

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <Breadcrumb />
      <Header
        store={selected}
        total={selectedTotal}
        isCheapest={isCheapest}
        missingHere={missingHere}
      />
      <ItemList cart={validCart} products={products} store={selected} />
      {otherStores.length > 0 && (
        <SwitchStore otherStores={otherStores} totals={totals.totals} missing={totals.missing} />
      )}
    </div>
  )
}

function Breadcrumb() {
  return (
    <nav className="text-[15px] text-mocha mb-6">
      <Link
        href="/handleliste"
        className="text-ink hover:text-rose-dusty hover:underline transition-colors"
      >
        Handleliste
      </Link>
      <span className="mx-2 text-rose-dusty">›</span>
      <span className="italic font-serif text-ink">Kjøpsoversikt</span>
    </nav>
  )
}

function Header({ store, total, isCheapest, missingHere }) {
  return (
    <header className="mb-10 text-center">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3">
        {isCheapest ? "✿ Beste valg" : "Ditt valg"}
      </p>
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink leading-tight">
        Klar til å handle hos {store.name}
      </h1>
      <div className="mt-4 inline-block h-px w-16 bg-rose-dusty" />
      <p className="mt-6 text-mocha max-w-md mx-auto text-sm">
        Klikk på et produkt for å åpne det hos {store.name} og legge det
        i deres handlekurv.
      </p>

      <div
        className={`mt-8 inline-flex items-baseline gap-2 rounded-full px-6 py-3 border ${
          isCheapest ? "bg-mint-soft/30 border-mint-soft" : "bg-blush-50 border-rose-mist"
        }`}
      >
        {isCheapest && <span className="text-rose-dusty">✿</span>}
        <span className="font-serif italic text-mocha text-sm">Totalt</span>
        <span className="font-semibold text-ink text-2xl tabular-nums">
          {formatKr(total)}
        </span>
        <span className="text-xs text-mocha">kr</span>
      </div>

      {missingHere > 0 && (
        <p className="mt-4 text-xs text-mocha italic font-serif">
          Merk: {missingHere} {missingHere === 1 ? "produkt" : "produkter"} er ikke tilgjengelig hos {store.name}.
        </p>
      )}
    </header>
  )
}

function ItemList({ cart, products, store }) {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="px-6 py-4 border-b border-rose-mist">
        <span className="text-xs uppercase tracking-wider text-mocha">
          {cart.length} {cart.length === 1 ? "produkt" : "produkter"}
        </span>
      </div>

      {cart.map((item, idx) => {
        const product = products.find(p => p.id === item.productId)
        return (
          <Item
            key={item.productId}
            product={product}
            quantity={item.quantity}
            store={store}
            last={idx === cart.length - 1}
          />
        )
      })}
    </div>
  )
}

function Item({ product, quantity, store, last }) {
  const listing = product.listings.find(l => l.store_slug === store.slug)
  const category = categories.find(c => c.slug === product.category)

  if (!listing) {
    return (
      <div
        className={`grid grid-cols-[auto_1fr_auto] gap-4 p-5 items-center bg-cream/40 ${
          last ? "" : "border-b border-rose-mist"
        }`}
      >
        <div className="w-14 h-14 rounded-lg bg-white border border-rose-mist flex items-center justify-center text-3xl flex-shrink-0">
          <span aria-hidden>{category?.emoji ?? "🛒"}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-ink truncate">{displayName(product)}</h3>
          <p className="text-sm text-mocha">
            Ikke tilgjengelig hos {store.name}
          </p>
        </div>
        <div className="text-right text-xs text-stone-300 tabular-nums">
          —
        </div>
      </div>
    )
  }

  const unitPrice = effectivePrice(listing)
  const lineTotal = unitPrice * quantity
  const isCampaign = hasCampaign(listing)

  const className = `group grid grid-cols-[auto_1fr_auto] gap-4 p-5 items-center hover:bg-cream/50 transition-colors ${
    last ? "" : "border-b border-rose-mist"
  }`

  const inner = (
    <>
      <div className="w-14 h-14 rounded-lg bg-white border border-rose-mist flex items-center justify-center text-3xl flex-shrink-0">
        <span aria-hidden>{category?.emoji ?? "🛒"}</span>
      </div>

      <div className="min-w-0">
        <h3 className="font-medium text-ink truncate">{displayName(product)}</h3>
        <p className="text-sm text-mocha">
          {listing.size != null && (
            <>
              {Number.isInteger(listing.size) ? listing.size : listing.size.toString().replace(".", ",")}
              {listing.unit ? ` ${listing.unit}` : ""}
              {" · "}
            </>
          )}
          <span className="tabular-nums">{quantity} stk</span>
          {isCampaign && (
            <span className="ml-2 text-[10px] uppercase tracking-wide text-ink bg-peach-soft/60 rounded-full px-2 py-0.5">
              ✦ Tilbud
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right tabular-nums">
          <div className="text-xs text-mocha">
            {formatKr(unitPrice)} × {quantity}
          </div>
          <div className="font-semibold text-ink">
            {formatKr(lineTotal)} kr
          </div>
        </div>
        {listing.url && (
          <span className="text-sky-soft text-xl group-hover:translate-x-0.5 transition-transform">
            ↗
          </span>
        )}
      </div>
    </>
  )

  if (listing.url) {
    return (
      <a href={listing.url} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }
  return <div className={className}>{inner}</div>
}

function SwitchStore({ otherStores, totals, missing }) {
  return (
    <section className="mt-10">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
        Eller
      </p>
      <h2 className="font-serif italic text-xl text-ink mb-4">
        Bytt butikk
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {otherStores.map(s => (
          <Link
            key={s.slug}
            href={`/handleliste/kjop?store=${s.slug}`}
            className="rounded-xl border border-rose-mist bg-blush-50 p-4 flex items-center justify-between hover:border-rose-dusty transition-colors"
          >
            <div>
              <div className="font-medium text-ink">{s.name}</div>
              <div className="text-xs text-mocha">
                {missing[s.slug] > 0
                  ? `Mangler ${missing[s.slug]}`
                  : "Bytt for å handle her i stedet"}
              </div>
            </div>
            <div className="text-right tabular-nums">
              <div className="text-mocha text-xs">Totalt</div>
              <div className="font-semibold text-ink">
                {formatKr(totals[s.slug])}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function computeTotals(cart, products) {
  const totals = {}
  const missing = {}
  for (const s of stores) {
    totals[s.slug] = 0
    missing[s.slug] = 0
  }
  for (const item of cart) {
    const product = products.find(p => p.id === item.productId)
    if (!product) continue
    for (const s of stores) {
      const listing = product.listings.find(l => l.store_slug === s.slug)
      if (!listing) {
        missing[s.slug] += 1
        continue
      }
      totals[s.slug] += effectivePrice(listing) * item.quantity
    }
  }
  return { totals, missing }
}

function findCheapestStore(totals) {
  const withAll = stores.filter(s => totals.missing[s.slug] === 0)
  const pool = withAll.length > 0 ? withAll : stores
  let best = pool[0].slug
  for (const s of pool) {
    if (totals.totals[s.slug] < totals.totals[best]) best = s.slug
  }
  return best
}
