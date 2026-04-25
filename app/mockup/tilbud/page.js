import Link from "next/link"
import { campaignProducts, stores, cheapestStore, categories, discountPercent } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"

export const metadata = { title: "Mockup · Tilbud" }

export default function MockupTilbud() {
  const deals = campaignProducts()

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar active="tilbud" />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <Header count={deals.length} />
          <CategoryFilter />
          <DealGrid deals={deals} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Header({ count }) {
  return (
    <header className="mb-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-peach-soft/30 px-3 py-1 text-xs uppercase tracking-wider text-ink mb-4">
        <span>✦</span>
        <span>Ukens kampanjer</span>
      </div>
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink">
        Alle tilbud akkurat nå
      </h1>
      <div className="mt-3 h-px w-16 bg-rose-dusty" />
      <p className="mt-4 text-mocha text-sm">
        {count} produkter med kampanjepris, sortert etter{" "}
        <span className="italic font-serif text-ink">størst rabatt først</span>.
      </p>
    </header>
  )
}

function CategoryFilter() {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 text-sm overflow-x-auto">
      <Chip active>Alle kategorier</Chip>
      {categories.map(c => (
        <Chip key={c.slug}>
          <span className="mr-1">{c.emoji}</span>
          {c.name}
        </Chip>
      ))}
    </div>
  )
}

function Chip({ children, active }) {
  const base = "rounded-full px-4 py-2 border transition-colors whitespace-nowrap"
  const on = "bg-rose-dusty text-white border-rose-dusty"
  const off = "bg-blush-50 text-mocha border-rose-mist hover:border-rose-dusty"
  return <button className={`${base} ${active ? on : off}`}>{children}</button>
}

function DealGrid({ deals }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {deals.map(p => <DealCard key={p.id} product={p} />)}
    </div>
  )
}

function DealCard({ product }) {
  const cheapest = cheapestStore(product)
  const cheapestStoreObj = stores.find(s => s.slug === cheapest.slug)
  const cheapestPrice = product.prices[cheapest.slug]
  const hasCampaign = !!cheapestPrice.campaign
  const pct = discountPercent(product)
  const category = categories.find(c => c.slug === product.category)

  return (
    <Link
      href="/mockup/produkt"
      className="group rounded-xl border border-rose-mist bg-blush-50 p-5 flex flex-col gap-4 hover:border-rose-dusty transition-colors"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="relative aspect-square rounded-lg bg-white flex items-center justify-center text-7xl border border-rose-mist">
        <span aria-hidden>{product.emoji}</span>
        <span className="absolute top-3 left-3 rounded-full bg-peach-soft/90 text-ink text-xs uppercase tracking-wide px-3 py-1 font-medium">
          ✦ −{pct}%
        </span>
        {category && (
          <span className="absolute bottom-3 right-3 rounded-full bg-cream/90 border border-rose-mist text-mocha text-[10px] px-2 py-1">
            {category.emoji} {category.name}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-medium text-ink">{product.name}</h3>
        <p className="text-sm text-mocha">{product.size} · {product.meta}</p>
      </div>

      <div className="space-y-2">
        {stores.map(s => {
          const p = product.prices[s.slug]
          if (!p) {
            return (
              <div key={s.slug} className="flex justify-between items-center text-sm">
                <span className="text-mocha">{s.name}</span>
                <span className="text-stone-300 tabular-nums">—</span>
              </div>
            )
          }
          const isCheapest = s.slug === cheapest.slug
          const has = !!p.campaign
          const show = has ? p.campaign.price : p.price
          return (
            <div
              key={s.slug}
              className={`flex justify-between items-center text-sm ${
                isCheapest ? "bg-mint-soft/40 rounded-lg -mx-2 px-2 py-1" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                {isCheapest && <span className="text-rose-dusty">✿</span>}
                <span className={isCheapest ? "text-ink font-medium" : "text-mocha"}>
                  {s.name}
                </span>
                {has && !isCheapest && (
                  <span className="rounded-full bg-peach-soft/60 text-ink text-[10px] px-2 py-0.5">
                    ✦
                  </span>
                )}
              </span>
              <span className="flex items-center gap-2 tabular-nums">
                {has && (
                  <span className="text-xs text-mocha line-through">
                    {p.price.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <span className={`${isCheapest ? "font-semibold" : ""} text-ink`}>
                  {show.toFixed(2).replace(".", ",")}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-rose-mist flex items-center justify-between text-xs text-mocha">
        <span className="italic font-serif">Pris per enhet</span>
        <span className="tabular-nums">{product.pricePerUnit}</span>
      </div>
    </Link>
  )
}
