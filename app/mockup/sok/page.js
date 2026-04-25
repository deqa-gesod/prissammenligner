import Link from "next/link"
import { mockProducts, stores, cheapestStore, categories } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"

export const metadata = { title: "Mockup · Søk" }

// Mock: brukeren har s\u00f8kt "melk" \u2014 viser de 3 melk-produktene (Tine, Q, en lenker)
export default function MockupSok() {
  const query = "melk"
  const results = mockProducts.filter(p =>
    p.name.toLowerCase().includes("melk")
  )

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <SearchHeader query={query} count={results.length} />
          <ResultsTable results={results} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SearchHeader({ query, count }) {
  return (
    <header className="mb-8">
      <div className="relative max-w-2xl">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mocha text-lg">⌕</span>
        <input
          type="text"
          defaultValue={query}
          className="w-full rounded-full border-2 border-rose-dusty bg-blush-50 pl-12 pr-5 py-4 text-base text-ink focus:outline-none"
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha hover:text-ink w-8 h-8 rounded-full flex items-center justify-center"
          aria-label="Fjern søk"
        >
          ✕
        </button>
      </div>

      <p className="mt-5 text-sm text-mocha">
        {count} treff for{" "}
        <span className="italic font-serif text-ink">"{query}"</span>
      </p>
    </header>
  )
}

function ResultsTable({ results }) {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 overflow-hidden mb-16"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-6 py-4 border-b border-rose-mist text-xs uppercase tracking-wider text-mocha">
        <div>Produkt</div>
        <div className="text-center">Oda</div>
        <div className="text-center">Meny</div>
        <div className="text-center">Spar</div>
        <div className="text-right">Pris/enhet</div>
      </div>

      {results.map(p => <ResultRow key={p.id} product={p} />)}
    </div>
  )
}

function ResultRow({ product }) {
  const cheapest = cheapestStore(product)
  const category = categories.find(c => c.slug === product.category)

  return (
    <Link
      href="/mockup/produkt"
      className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-5 border-b border-rose-mist last:border-b-0 items-center hover:bg-cream/50 transition-colors"
    >
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>{product.emoji}</span>
          <div>
            <div className="font-medium text-ink">
              <HighlightMatch text={product.name} needle="melk" />
            </div>
            <div className="text-sm text-mocha flex items-center gap-2">
              <span>{product.size} · {product.meta}</span>
              {category && (
                <span className="text-stone-300">·</span>
              )}
              {category && (
                <span className="italic font-serif text-xs">
                  {category.emoji} {category.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {stores.map(s => (
        <div key={s.slug} className="hidden sm:block">
          <PriceCell store={s} product={product} isCheapest={cheapest?.slug === s.slug} />
        </div>
      ))}

      <div className="hidden sm:block text-right text-sm text-mocha tabular-nums">
        {product.pricePerUnit}
      </div>
    </Link>
  )
}

function HighlightMatch({ text, needle }) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase())
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <span className="bg-peach-soft/50 rounded px-0.5">
        {text.slice(i, i + needle.length)}
      </span>
      {text.slice(i + needle.length)}
    </>
  )
}

function PriceCell({ store, product, isCheapest }) {
  const p = product.prices[store.slug]
  if (!p) {
    return <div className="text-center text-stone-300 tabular-nums">—</div>
  }
  const has = !!p.campaign
  const show = has ? p.campaign.price : p.price
  const bg = isCheapest ? "bg-mint-soft/40" : ""
  return (
    <div className={`rounded-lg py-2 px-3 text-center ${bg}`}>
      <div className="flex items-center justify-center gap-1 tabular-nums">
        {isCheapest && <span className="text-rose-dusty">✿</span>}
        <span className="font-semibold text-ink">
          {show.toFixed(2).replace(".", ",")}
        </span>
      </div>
      {has && (
        <div className="text-[10px] text-mocha line-through tabular-nums mt-0.5">
          {p.price.toFixed(2).replace(".", ",")}
        </div>
      )}
    </div>
  )
}

function PopularSearches() {
  const suggestions = [
    "jarlsberg",
    "smør",
    "eple",
    "kyllingfilet",
    "kvikk lunsj",
    "brus",
  ]
  return (
    <section className="mb-16">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
        Populære søk
      </p>
      <h2 className="font-serif italic text-xl text-ink mb-4">
        Trender akkurat nå
      </h2>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => (
          <Link
            key={s}
            href={`/mockup/sok?q=${s}`}
            className="rounded-full bg-blush-50 border border-rose-mist px-4 py-2 text-sm text-mocha hover:border-rose-dusty hover:text-ink transition-colors"
          >
            {s}
          </Link>
        ))}
      </div>
    </section>
  )
}

function EmptyStateExample() {
  return (
    <section>
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-rose-mist" />
        <span className="text-xs uppercase tracking-wider text-mocha font-serif italic">
          Tom tilstand (søk uten treff)
        </span>
        <div className="h-px flex-1 bg-rose-mist" />
      </div>
      <div
        className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
        style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
      >
        <div className="text-5xl mb-4 text-rose-dusty" aria-hidden>✿</div>
        <h2 className="font-serif italic text-2xl text-ink mb-2">
          Ingen treff
        </h2>
        <p className="text-mocha text-sm max-w-md mx-auto mb-6">
          Vi fant ingen produkter som matcher{" "}
          <span className="italic font-serif text-ink">"akevitt"</span>.
          Prøv et annet ord, eller bla i kategoriene.
        </p>
        <Link
          href="/mockup/forside"
          className="inline-block rounded-full bg-rose-dusty text-white px-6 py-2 text-sm hover:bg-rose-dusty/90 transition-colors"
        >
          Til forsiden
        </Link>
      </div>
    </section>
  )
}
