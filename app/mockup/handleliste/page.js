"use client"

import Link from "next/link"
import { useState } from "react"
import { mockProducts, stores, mockCart, cartTotals } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"

export default function MockupHandleliste() {
  const { totals, missing } = cartTotals(mockCart)
  const cheapestSlug = stores.reduce(
    (min, s) => (totals[s.slug] < totals[min] ? s.slug : min),
    stores[0].slug
  )
  const [selectedSlug, setSelectedSlug] = useState(cheapestSlug)

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <Header itemCount={mockCart.length} />

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
            <CartItems />
            <TotalsCard
              totals={totals}
              missing={missing}
              cheapestSlug={cheapestSlug}
              selectedSlug={selectedSlug}
              onSelect={setSelectedSlug}
            />
          </div>
        </div>
      </main>

      <Footer />
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
      <p className="mt-4 text-mocha text-sm">
        {itemCount} produkter i lista. Velg butikken du vil handle hos til høyre.
      </p>
    </header>
  )
}

function CartItems() {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      {mockCart.map((item, idx) => {
        const product = mockProducts.find(p => p.id === item.productId)
        return (
          <CartRow
            key={item.productId}
            product={product}
            quantity={item.quantity}
            last={idx === mockCart.length - 1}
          />
        )
      })}
    </div>
  )
}

function CartRow({ product, quantity, last }) {
  const minPrice = Math.min(
    ...stores
      .map(s => product.prices[s.slug])
      .filter(Boolean)
      .map(p => (p.campaign ? p.campaign.price : p.price))
  )

  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] gap-4 p-5 items-center ${
        last ? "" : "border-b border-rose-mist"
      }`}
    >
      <div className="w-16 h-16 rounded-lg bg-white border border-rose-mist flex items-center justify-center text-3xl">
        <span aria-hidden>{product.emoji}</span>
      </div>

      <div>
        <h3 className="font-medium text-ink">{product.name}</h3>
        <p className="text-sm text-mocha">{product.size} · {product.meta}</p>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-mocha">Billigste: </span>
          <span className="tabular-nums font-medium text-ink">
            {minPrice.toFixed(2).replace(".", ",")} kr
          </span>
          <span className="text-stone-300">·</span>
          <button className="text-mocha hover:text-rose-dusty">Se detaljer →</button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <QtyPicker quantity={quantity} />
        <button className="text-xs text-mocha hover:text-rose-dusty transition-colors">
          Fjern
        </button>
      </div>
    </div>
  )
}

function QtyPicker({ quantity }) {
  return (
    <div className="flex items-center rounded-full border border-rose-mist bg-cream">
      <button className="w-8 h-8 flex items-center justify-center text-mocha hover:text-ink">−</button>
      <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
      <button className="w-8 h-8 flex items-center justify-center text-mocha hover:text-ink">+</button>
    </div>
  )
}

function TotalsCard({ totals, missing, cheapestSlug, selectedSlug, onSelect }) {
  const selectedStore = stores.find(s => s.slug === selectedSlug)
  const cheapestTotal = totals[cheapestSlug]
  const selectedTotal = totals[selectedSlug]
  const diff = selectedTotal - cheapestTotal
  const isCheapestSelected = selectedSlug === cheapestSlug

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
          return (
            <li key={s.slug}>
              <button
                onClick={() => onSelect(s.slug)}
                className={`w-full text-left rounded-lg border-2 px-4 py-3 flex items-center justify-between transition-all ${
                  isSelected
                    ? "border-mint-soft bg-mint-soft/30"
                    : "border-rose-mist bg-white hover:border-mint-soft/60"
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-mint-soft bg-mint-soft"
                        : "border-rose-mist"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <div>
                    <div className="font-medium text-ink flex items-center gap-2">
                      {s.name}
                      {isCheapest && (
                        <span
                          className="text-rose-dusty text-base"
                          title="Billigste"
                          aria-label="Billigste butikk"
                        >
                          ✿
                        </span>
                      )}
                    </div>
                    {m > 0 && (
                      <div className="text-[10px] text-ink bg-lavender-soft/50 rounded-full px-2 py-0.5 inline-block mt-1">
                        Mangler {m}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-semibold text-ink">
                    {total.toFixed(2).replace(".", ",")}
                  </div>
                  <div className="text-[10px] text-mocha uppercase tracking-wide">kr</div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 pt-6 border-t border-rose-mist">
        <p className="text-xs text-mocha mb-3 italic font-serif">
          {isCheapestSelected ? (
            <>
              Du sparer{" "}
              <span className="text-ink not-italic font-sans tabular-nums">
                {(Math.max(...Object.values(totals)) - cheapestTotal)
                  .toFixed(2)
                  .replace(".", ",")}{" "}
                kr
              </span>{" "}
              ved å handle hos {selectedStore.name}.
            </>
          ) : (
            <>
              Du betaler{" "}
              <span className="text-ink not-italic font-sans tabular-nums">
                {diff.toFixed(2).replace(".", ",")} kr
              </span>{" "}
              mer enn hos billigste ({stores.find(s => s.slug === cheapestSlug).name}).
            </>
          )}
        </p>
        <Link
          href={`/mockup/kjop?store=${selectedSlug}`}
          className="w-full block text-center rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
        >
          Klar til å handle hos {selectedStore.name}? →
        </Link>
      </div>
    </aside>
  )
}
