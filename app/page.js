import Link from "next/link"
import sql from "./lib/db"
import { categories } from "./lib/categories"

export const revalidate = 0

const MEIERI_KATEGORIER = ["melk", "syrnet", "sjokolademelk", "proteindrikker"]

export default async function Home() {
  // Hent alle aktive listings med siste pris og kampanje, for meieri-kategoriene.
  // Bruker subquery for å finne siste snapshot per listing.
  const dealRows = await sql`
    SELECT
      l.product_id AS id,
      l.name_raw,
      l.size::float AS size,
      l.unit,
      s.slug AS store_slug,
      s.name AS store_name,
      ps.price::float AS price,
      ps.campaign_price::float AS campaign_price,
      ps.campaign_text
    FROM listing l
    JOIN product p ON p.id = l.product_id
    JOIN store s ON s.id = l.store_id
    JOIN price_snapshot ps ON ps.listing_id = l.id
    WHERE p.category = ANY(${MEIERI_KATEGORIER})
      AND ps.scraped_at = (
        SELECT MAX(scraped_at) FROM price_snapshot WHERE listing_id = l.id
      )
      AND ps.campaign_price IS NOT NULL
      AND ps.price > 0
      AND ps.campaign_price < ps.price
  `

  // Velg den beste tilbudet per produkt (kun ett oppslag per produkt på forsiden)
  const bestPerProduct = new Map()
  for (const r of dealRows) {
    const pct = Math.round((1 - r.campaign_price / r.price) * 100)
    const existing = bestPerProduct.get(r.id)
    if (!existing || pct > existing.pct) {
      bestPerProduct.set(r.id, { ...r, pct })
    }
  }
  const deals = [...bestPerProduct.values()]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4)

  const countRows = await sql`
    SELECT category, COUNT(*)::int AS n
    FROM product
    WHERE category IS NOT NULL
    GROUP BY category
  `
  const counts = Object.fromEntries(countRows.map(r => [r.category, r.n]))

  return (
    <>
      <Hero />
      <WeeklyDeals deals={deals} />
      <CategoryGrid counts={counts} />
    </>
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

      <form action="/sok" className="mt-10 max-w-xl mx-auto">
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mocha">⌕</span>
          <input
            type="text"
            name="q"
            placeholder="Søk melk, jarlsberg, kyllingfilet…"
            className="w-full rounded-full border border-rose-mist bg-blush-50 pl-12 pr-5 py-4 text-sm placeholder:text-mocha focus:outline-none focus:border-rose-dusty"
          />
        </div>
      </form>
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
          href="/tilbud"
          className="hidden sm:inline-flex items-center gap-2 text-base text-ink hover:text-rose-dusty hover:underline transition-colors"
        >
          Se alle tilbud <span className="italic font-serif text-lg">→</span>
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-xl border border-rose-mist bg-blush-50 py-12 px-6 text-center text-mocha text-sm">
          Ingen aktive tilbud akkurat nå. Sjekk tilbake snart.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {deals.map(d => <DealCard key={d.id} deal={d} />)}
        </div>
      )}

      <Link
        href="/tilbud"
        className="sm:hidden mt-6 block text-center text-base text-ink hover:text-rose-dusty hover:underline"
      >
        Se alle tilbud →
      </Link>
    </section>
  )
}

function DealCard({ deal }) {
  return (
    <Link
      href={`/produkt/${deal.id}`}
      className="group rounded-xl border border-rose-mist bg-blush-50 p-4 flex flex-col gap-3 hover:border-rose-dusty transition-colors"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="relative aspect-square rounded-lg bg-white flex items-center justify-center text-5xl sm:text-6xl border border-rose-mist">
        <span aria-hidden>🥛</span>
        {deal.pct > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-peach-soft/80 text-ink text-[10px] uppercase tracking-wide px-2 py-1">
            ✦ −{deal.pct}%
          </span>
        )}
      </div>
      <div>
        <h3 className="font-medium text-ink text-sm line-clamp-2">{deal.name_raw}</h3>
        {deal.size && (
          <p className="text-xs text-mocha">
            {Number.isInteger(deal.size) ? deal.size : deal.size.toString().replace(".", ",")}
            {deal.unit ? ` ${deal.unit}` : ""}
          </p>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="font-semibold text-ink">
              {deal.campaign_price.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-xs text-mocha line-through">
              {deal.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="text-xs text-mocha mt-1">
            <span className="text-rose-dusty">✿</span> hos {deal.store_name}
          </div>
        </div>
      </div>
    </Link>
  )
}

function CategoryGrid({ counts }) {
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {categories.map(c => {
          const n = counts[c.slug] ?? 0
          return (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className="group rounded-xl border border-rose-mist bg-blush-50 p-6 flex flex-col gap-3 hover:border-rose-dusty hover:bg-blush-50/70 transition-all"
              style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
            >
              <span className="text-4xl sm:text-5xl" aria-hidden>{c.emoji}</span>
              <div>
                <h3 className="font-serif italic text-xl sm:text-2xl text-ink leading-tight">
                  {c.name}
                </h3>
                <p className="text-sm text-mocha tabular-nums mt-1">
                  {n} {n === 1 ? "produkt" : "produkter"}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
