"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { stores } from "../lib/stores"
import {
  formatKr,
  formatSize,
  effectivePrice,
  cheapestListing,
  displayName,
} from "../lib/format"
import { categories } from "../lib/categories"
import {
  readCart,
  setQuantity,
  removeFromCart,
} from "../lib/cart"
import { getCartProducts } from "../lib/cart-server"

export default function HandlelistePage() {
  const [cart, setCart] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [userSelectedSlug, setUserSelectedSlug] = useState(null)

  async function load() {
    const items = readCart()
    const ids = items.map(i => i.productId)
    if (ids.length === 0) {
      setCart(items)
      setProducts([])
      setLoading(false)
      return
    }
    const rows = await getCartProducts(ids)
    setCart(items)
    setProducts(rows)
    setLoading(false)
  }

  useEffect(() => {
    load()
    function onChange() {
      load()
    }
    window.addEventListener("cart-changed", onChange)
    window.addEventListener("storage", onChange)
    return () => {
      window.removeEventListener("cart-changed", onChange)
      window.removeEventListener("storage", onChange)
    }
  }, [])

  const validCart = cart
    ? cart.filter(item => products.some(p => p.id === item.productId))
    : []
  const totals = computeTotals(validCart, products)
  const cheapestSlug = findCheapestStore(totals)
  const selectedSlug = userSelectedSlug ?? cheapestSlug

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <Header itemCount={null} />
        <LoadingState />
      </div>
    )
  }

  if (validCart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
            ✿ Samlet sammenligning
          </p>
          <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink">
            Min handleliste
          </h1>
          <div className="mt-3 h-px w-16 bg-rose-dusty" />
          <p className="mt-4 text-mocha text-sm">
            Du har ingen produkter i lista ennå.
          </p>
        </header>

        <section
          className="rounded-xl border border-rose-mist bg-blush-50 py-20 px-6 text-center"
          style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
        >
          <div className="text-6xl mb-6 text-rose-dusty" aria-hidden>✿</div>
          <h2 className="font-serif italic text-3xl text-ink mb-4">
            Handlelista er tom
          </h2>
          <p className="text-mocha text-sm max-w-md mx-auto mb-8">
            Legg til produkter fra kategoriene for å se totalsum per
            butikk og finne ut hvor det er billigst å handle akkurat din kurv.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/kategori/melk"
              className="inline-block rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
            >
              Utforsk produkter
            </Link>
            <Link
              href="/tilbud"
              className="inline-block rounded-full border border-rose-mist bg-white text-ink px-6 py-3 text-sm hover:border-rose-dusty transition-colors"
            >
              Se ukens tilbud ✦
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <Header itemCount={validCart.length} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        <CartItems cart={validCart} products={products} />
        <TotalsCard
          totals={totals.totals}
          missing={totals.missing}
          cartLength={validCart.length}
          cheapestSlug={cheapestSlug}
          selectedSlug={selectedSlug}
          onSelect={setUserSelectedSlug}
        />
      </div>
    </div>
  )
}

function Header({ itemCount }) {
  return (
    <header className="mb-8">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
        ✿ Samlet sammenligning
      </p>
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink">
        Min handleliste
      </h1>
      <div className="mt-3 h-px w-16 bg-rose-dusty" />
      {itemCount != null && (
        <p className="mt-4 text-mocha text-sm">
          {itemCount} {itemCount === 1 ? "produkt" : "produkter"} i lista. Velg butikken du vil handle hos til høyre.
        </p>
      )}
    </header>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
      <div className="rounded-xl border border-rose-mist bg-blush-50 p-6 animate-pulse">
        <div className="h-16 bg-rose-mist/60 rounded mb-3" />
        <div className="h-16 bg-rose-mist/60 rounded mb-3" />
        <div className="h-16 bg-rose-mist/60 rounded" />
      </div>
      <div className="rounded-xl border border-rose-mist bg-blush-50 p-6 animate-pulse h-fit">
        <div className="h-4 w-1/2 bg-rose-mist rounded mb-4" />
        <div className="h-12 bg-rose-mist/60 rounded mb-2" />
        <div className="h-12 bg-rose-mist/60 rounded mb-2" />
        <div className="h-12 bg-rose-mist/60 rounded" />
      </div>
    </div>
  )
}

function CartItems({ cart, products }) {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      {cart.map((item, idx) => {
        const product = products.find(p => p.id === item.productId)
        return (
          <CartRow
            key={item.productId}
            product={product}
            quantity={item.quantity}
            last={idx === cart.length - 1}
          />
        )
      })}
    </div>
  )
}

function CartRow({ product, quantity, last }) {
  const cheapest = cheapestListing(product)
  const category = categories.find(c => c.slug === product.category)
  const sample = product.listings[0]

  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] gap-4 p-5 items-center ${
        last ? "" : "border-b border-rose-mist"
      }`}
    >
      <div className="w-16 h-16 rounded-lg bg-white border border-rose-mist flex items-center justify-center text-3xl">
        <span aria-hidden>{category?.emoji ?? "🛒"}</span>
      </div>

      <div className="min-w-0">
        <h3 className="font-medium text-ink truncate">{displayName(product)}</h3>
        {sample?.size != null && (
          <p className="text-sm text-mocha">
            {formatSize(sample)}
          </p>
        )}
        {cheapest && (
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-mocha">Billigste: </span>
            <span className="tabular-nums font-medium text-ink">
              {formatKr(cheapest.effective)} kr
            </span>
            <span className="text-stone-300">·</span>
            <Link
              href={`/produkt/${product.id}`}
              className="text-mocha hover:text-rose-dusty"
            >
              Se detaljer →
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-3">
        <QtyPicker
          quantity={quantity}
          onIncrement={() => setQuantity(product.id, quantity + 1)}
          onDecrement={() => setQuantity(product.id, quantity - 1)}
        />
        <button
          onClick={() => removeFromCart(product.id)}
          className="text-xs text-mocha hover:text-rose-dusty transition-colors"
        >
          Fjern
        </button>
      </div>
    </div>
  )
}

function QtyPicker({ quantity, onIncrement, onDecrement }) {
  return (
    <div className="flex items-center rounded-full border border-rose-mist bg-cream">
      <button
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center text-mocha hover:text-ink"
        aria-label="Reduser antall"
      >
        −
      </button>
      <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center text-mocha hover:text-ink"
        aria-label="Øk antall"
      >
        +
      </button>
    </div>
  )
}

function TotalsCard({ totals, missing, cartLength, cheapestSlug, selectedSlug, onSelect }) {
  const selectedStore = stores.find(s => s.slug === selectedSlug)
  const cheapestTotal = totals[cheapestSlug]
  const selectedTotal = totals[selectedSlug]
  const diff = selectedTotal - cheapestTotal
  const isCheapestSelected = selectedSlug === cheapestSlug
  const availableStores = stores.filter(s => missing[s.slug] < cartLength)
  const onlyOneAvailable = availableStores.length === 1
  const maxAvailableTotal = availableStores.length > 0
    ? Math.max(...availableStores.map(s => totals[s.slug]))
    : 0

  return (
    <aside
      className="rounded-xl border border-rose-mist bg-blush-50 p-6 h-fit lg:sticky lg:top-24"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
        Velg butikk
      </p>
      <h2 className="font-serif italic text-2xl text-ink mb-2">
        Hvor vil du handle?
      </h2>
      <p className="text-xs text-mocha mb-6 italic font-serif">
        Billigste er valgt automatisk. Klikk på en annen for å bytte.
      </p>

      <ul className="space-y-3">
        {stores.map(s => {
          const isCheapest = s.slug === cheapestSlug
          const isSelected = s.slug === selectedSlug
          const total = totals[s.slug]
          const m = missing[s.slug]
          const fullyMissing = m === cartLength
          return (
            <li key={s.slug}>
              <button
                onClick={() => fullyMissing ? null : onSelect(s.slug)}
                disabled={fullyMissing}
                className={`w-full text-left rounded-lg border-2 px-4 py-3 flex items-center justify-between transition-all ${
                  fullyMissing
                    ? "border-rose-mist bg-blush-50/40 opacity-50 cursor-not-allowed"
                    : isSelected
                      ? "border-mint-soft bg-mint-soft/30"
                      : "border-rose-mist bg-white hover:border-mint-soft/60"
                }`}
                aria-pressed={isSelected}
                aria-disabled={fullyMissing}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected && !fullyMissing
                        ? "border-mint-soft bg-mint-soft"
                        : "border-rose-mist"
                    }`}
                  >
                    {isSelected && !fullyMissing && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <div>
                    <div className="font-medium text-ink flex items-center gap-2">
                      {s.name}
                      {isCheapest && m === 0 && !onlyOneAvailable && (
                        <span
                          className="text-rose-dusty text-base"
                          title="Billigste"
                          aria-label="Billigste butikk"
                        >
                          ✿
                        </span>
                      )}
                    </div>
                    {fullyMissing ? (
                      <div className="text-[10px] text-mocha italic font-serif mt-1">
                        Ingen av produktene
                      </div>
                    ) : m > 0 ? (
                      <div className="text-[10px] text-ink bg-lavender-soft/50 rounded-full px-2 py-0.5 inline-block mt-1">
                        Mangler {m}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="text-right tabular-nums">
                  {fullyMissing ? (
                    <div className="text-mocha">—</div>
                  ) : (
                    <>
                      <div className="font-semibold text-ink">
                        {formatKr(total)}
                      </div>
                      <div className="text-[10px] text-mocha uppercase tracking-wide">kr</div>
                    </>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 pt-6 border-t border-rose-mist">
        <p className="text-xs text-mocha mb-3 italic font-serif">
          {onlyOneAvailable ? (
            <>
              Kun tilgjengelig hos{" "}
              <span className="text-ink not-italic font-sans">
                {availableStores[0].name}
              </span>.
            </>
          ) : isCheapestSelected ? (
            <>
              Du sparer{" "}
              <span className="text-ink not-italic font-sans tabular-nums">
                {formatKr(maxAvailableTotal - cheapestTotal)} kr
              </span>{" "}
              ved å handle hos {selectedStore.name}.
            </>
          ) : (
            <>
              Du betaler{" "}
              <span className="text-ink not-italic font-sans tabular-nums">
                {formatKr(diff)} kr
              </span>{" "}
              mer enn hos billigste ({stores.find(s => s.slug === cheapestSlug).name}).
            </>
          )}
        </p>
        <Link
          href={`/handleliste/kjop?store=${selectedSlug}`}
          className="w-full block text-center rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
        >
          Klar til å handle hos {selectedStore.name}? →
        </Link>
      </div>
    </aside>
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
  // Foretrekk butikker som har alle produktene; ellers velg billigst av alle
  const withAll = stores.filter(s => totals.missing[s.slug] === 0)
  const pool = withAll.length > 0 ? withAll : stores
  let best = pool[0].slug
  for (const s of pool) {
    if (totals.totals[s.slug] < totals.totals[best]) best = s.slug
  }
  return best
}

