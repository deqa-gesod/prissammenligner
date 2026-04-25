import Link from "next/link"
import { categories, campaignProducts, stores, cheapestStore } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"

export const metadata = { title: "Mockup · Forside" }

export default function MockupForside() {
  const deals = campaignProducts().slice(0, 4)

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar />

      <main className="flex-1">
        <Hero />
        <WeeklyDeals deals={deals} />
        <CategoryGrid />
      </main>

      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 pb-12 text-center">
      <div className="inline-block text-rose-dusty text-sm mb-4">✿ ✿ ✿</div>
      <h1 className="font-serif italic font-light text-5xl sm:text-7xl text-ink leading-tight">
        Prissammenligner
      </h1>
      <p className="mt-6 text-mocha max-w-xl mx-auto">
        Sammenlign priser på meieri, frukt, kjøtt og mer fra{" "}
        <span className="italic font-serif text-ink">Oda</span>,{" "}
        <span className="italic font-serif text-ink">Meny</span> og{" "}
        <span className="italic font-serif text-ink">Spar</span>.
        Oppdateres hver sjette time.
      </p>

      <div className="mt-10 max-w-xl mx-auto">
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mocha">⌕</span>
          <input
            type="text"
            placeholder="Søk melk, jarlsberg, kyllingfilet…"
            className="w-full rounded-full border border-rose-mist bg-blush-50 pl-12 pr-5 py-4 text-sm placeholder:text-mocha focus:outline-none focus:border-rose-dusty"
          />
        </div>
      </div>
    </section>
  )
}

function WeeklyDeals({ deals }) {
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
            ✦ Ukens største tilbud
          </p>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-ink">
            Det er mye å spare
          </h2>
        </div>
        <Link
          href="/mockup/tilbud"
          className="hidden sm:inline-flex items-center gap-1 text-sm text-mocha hover:text-rose-dusty transition-colors"
        >
          Se alle tilbud <span className="italic font-serif">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {deals.map(p => <DealCard key={p.id} product={p} />)}
      </div>

      <Link
        href="/mockup/tilbud"
        className="sm:hidden mt-6 block text-center text-sm text-mocha hover:text-rose-dusty"
      >
        Se alle tilbud →
      </Link>
    </section>
  )
}

function DealCard({ product }) {
  const cheapest = cheapestStore(product)
  const cheapestStoreObj = stores.find(s => s.slug === cheapest.slug)
  const cheapestPriceData = product.prices[cheapest.slug]
  const hasCampaign = !!cheapestPriceData.campaign
  const pct = hasCampaign
    ? Math.round((1 - cheapestPriceData.campaign.price / cheapestPriceData.price) * 100)
    : 0

  return (
    <Link
      href="/mockup/produkt"
      className="group rounded-xl border border-rose-mist bg-blush-50 p-4 flex flex-col gap-3 hover:border-rose-dusty transition-colors"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="relative aspect-square rounded-lg bg-white flex items-center justify-center text-5xl sm:text-6xl border border-rose-mist">
        <span aria-hidden>{product.emoji}</span>
        {pct > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-peach-soft/80 text-ink text-[10px] uppercase tracking-wide px-2 py-1">
            ✦ −{pct}%
          </span>
        )}
      </div>
      <div>
        <h3 className="font-medium text-ink text-sm line-clamp-1">{product.name}</h3>
        <p className="text-xs text-mocha">{product.size}</p>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="font-semibold text-ink">
              {cheapest.price.toFixed(2).replace(".", ",")}
            </span>
            {hasCampaign && (
              <span className="text-xs text-mocha line-through">
                {cheapestPriceData.price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
          <div className="text-xs text-mocha mt-1">
            <span className="text-rose-dusty">✿</span> hos {cheapestStoreObj.name}
          </div>
        </div>
      </div>
    </Link>
  )
}

function CategoryGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
          Utforsk
        </p>
        <h2 className="font-serif italic text-3xl sm:text-4xl text-ink">
          Bla gjennom kategorier
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {categories.map(c => (
          <Link
            key={c.slug}
            href={`/mockup/a`}
            className="group rounded-xl border border-rose-mist bg-blush-50 p-6 sm:p-8 flex items-center gap-4 hover:border-rose-dusty hover:bg-blush-50/70 transition-all"
            style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
          >
            <span className="text-4xl sm:text-5xl" aria-hidden>{c.emoji}</span>
            <div>
              <h3 className="font-serif italic text-xl sm:text-2xl text-ink">
                {c.name}
              </h3>
              <p className="text-sm text-mocha tabular-nums">{c.count} produkter</p>
            </div>
            <span className="ml-auto text-mocha group-hover:text-rose-dusty transition-colors">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

