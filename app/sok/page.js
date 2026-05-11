import Link from "next/link"
import sql from "../lib/db"
import { groupByProduct } from "../lib/queries"
import { categories } from "../lib/categories"
import { stores } from "../lib/stores"
import {
  formatKr,
  formatSize,
  formatPricePerUnit,
  cheapestListing,
  displayName,
  hasCampaign,
  effectivePrice,
} from "../lib/format"

export const revalidate = 60

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams
  const q = (sp?.q ?? "").trim()
  return {
    title: q ? `Søk: ${q} · Prissammenligner` : "Søk · Prissammenligner",
  }
}

export default async function SokPage({ searchParams }) {
  const sp = await searchParams
  const q = (sp?.q ?? "").trim()

  let results = []
  if (q) {
    const pattern = `%${q}%`

    // Finn produkt-IDene som matcher søkeordet (på normalisert navn eller på listing-navn)
    const matchedIds = await sql`
      SELECT DISTINCT p.id
      FROM product p
      LEFT JOIN listing l ON l.product_id = p.id
      WHERE p.name_norm ILIKE ${pattern}
         OR l.name_raw ILIKE ${pattern}
      ORDER BY p.id
      LIMIT 100
    `
    const ids = matchedIds.map(r => r.id)

    if (ids.length > 0) {
      const rows = await sql`
        SELECT
          p.id AS product_id,
          p.name_norm,
          p.category,
          l.name_raw,
          l.size::float AS size,
          l.unit,
          l.url,
          s.slug AS store_slug,
          s.name AS store_name,
          ps.price::float AS price,
          ps.price_per_unit::float AS price_per_unit,
          ps.campaign_price::float AS campaign_price,
          ps.campaign_text
        FROM listing l
        JOIN product p ON p.id = l.product_id
        JOIN store s ON s.id = l.store_id
        JOIN price_snapshot ps ON ps.listing_id = l.id
        WHERE p.id = ANY(${ids})
          AND ps.scraped_at = (
            SELECT MAX(scraped_at) FROM price_snapshot WHERE listing_id = l.id
          )
      `
      results = groupByProduct(rows).sort((a, b) =>
        a.name_norm.localeCompare(b.name_norm)
      )
    }
  }

  const hasQuery = q.length > 0
  const hasResults = results.length > 0
  const wide = hasQuery && hasResults

  return (
    <div className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto px-6 sm:px-10 py-10 sm:py-14`}>
      <SearchHeader query={q} count={hasQuery ? results.length : null} />
      {hasQuery && hasResults && <ResultsTable results={results} query={q} />}
      {hasQuery && !hasResults && (
        <>
          <EmptyResult query={q} />
          <Suggestions />
        </>
      )}
      {!hasQuery && <Suggestions />}
    </div>
  )
}

function SearchHeader({ query, count }) {
  return (
    <header className="mb-8">
      <form action="/sok" className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mocha text-lg pointer-events-none">⌕</span>
        <input
          type="text"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Søk melk, jarlsberg, kyllingfilet…"
          className="w-full rounded-full border-2 border-rose-dusty bg-blush-50 pl-12 pr-12 py-4 text-base text-ink focus:outline-none placeholder:text-mocha"
        />
        {query && (
          <Link
            href="/sok"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha hover:text-ink w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Fjern søk"
          >
            ✕
          </Link>
        )}
      </form>

      {count !== null && (
        <p className="mt-5 text-sm text-mocha">
          {count} {count === 1 ? "treff" : "treff"} for{" "}
          <span className="italic font-serif text-ink">&quot;{query}&quot;</span>
        </p>
      )}
    </header>
  )
}

function ResultsTable({ results, query }) {
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

      {results.map(p => <ResultRow key={p.id} product={p} query={query} />)}
    </div>
  )
}

function ResultRow({ product, query }) {
  const cheapest = cheapestListing(product)
  const category = categories.find(c => c.slug === product.category)
  const emoji = category?.emoji ?? "🛒"
  const sample = product.listings[0]
  const ppuText = formatPricePerUnit(sample)

  return (
    <Link
      href={`/produkt/${product.id}`}
      className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-5 border-b border-rose-mist last:border-b-0 items-center hover:bg-cream/50 transition-colors"
    >
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0" aria-hidden>{emoji}</span>
          <div>
            <div className="font-medium text-ink">
              <HighlightMatch text={displayName(product)} needle={query} />
            </div>
            <div className="text-sm text-mocha flex items-center gap-2 flex-wrap">
              {sample?.size && <span>{formatSize(sample)}</span>}
              {category && sample?.size && <span className="text-stone-300">·</span>}
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
          <PriceCell
            listing={product.listings.find(l => l.store_slug === s.slug)}
            isCheapest={cheapest?.store_slug === s.slug}
          />
        </div>
      ))}

      <div className="hidden sm:block text-right text-sm text-mocha tabular-nums">
        {ppuText || "—"}
      </div>
    </Link>
  )
}

function HighlightMatch({ text, needle }) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase())
  if (i === -1 || !needle) return text
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

function PriceCell({ listing, isCheapest }) {
  if (!listing) {
    return <div className="text-center text-stone-300 tabular-nums">—</div>
  }
  const onCampaign = hasCampaign(listing)
  const bg = isCheapest ? "bg-mint-soft/40" : ""
  return (
    <div className={`rounded-lg py-2 px-3 text-center ${bg}`}>
      <div className="flex items-center justify-center gap-1 tabular-nums">
        {isCheapest && <span className="text-rose-dusty">✿</span>}
        <span className="font-semibold text-ink">{formatKr(effectivePrice(listing))}</span>
      </div>
      {onCampaign && (
        <div className="text-[10px] text-mocha line-through tabular-nums mt-0.5">
          {formatKr(listing.price)}
        </div>
      )}
    </div>
  )
}

function EmptyResult({ query }) {
  return (
    <section
      className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="text-6xl mb-6 text-rose-dusty" aria-hidden>✿</div>
      <h2 className="font-serif italic text-3xl text-ink mb-4">
        Ingen treff
      </h2>
      <p className="text-mocha text-sm max-w-md mx-auto mb-2">
        Vi fant ingen produkter som matcher{" "}
        <span className="italic font-serif text-ink">&quot;{query}&quot;</span>.
      </p>
      <p className="text-mocha text-sm max-w-md mx-auto mb-8">
        Det kan være at varen ikke føres hos Oda, Meny eller Spar — eller
        at den heter noe annet i butikken. Prøv et annet søkeord, eller
        bla i kategoriene.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-block rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
        >
          Til forsiden
        </Link>
        <Link
          href="/sok"
          className="inline-block rounded-full border border-rose-mist bg-white text-ink px-6 py-3 text-sm hover:border-rose-dusty transition-colors"
        >
          Tøm søkefeltet
        </Link>
      </div>
    </section>
  )
}

function Suggestions() {
  return (
    <section className="mt-12">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3 text-center">
        Eller bla gjennom
      </p>
      <h2 className="font-serif italic text-xl text-ink mb-6 text-center">
        Kategoriene
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(c => (
          <Link
            key={c.slug}
            href={`/kategori/${c.slug}`}
            className="rounded-xl border border-rose-mist bg-blush-50 p-4 flex items-center gap-3 hover:border-rose-dusty transition-colors"
          >
            <span className="text-2xl" aria-hidden>{c.emoji}</span>
            <div>
              <div className="font-medium text-ink text-sm">{c.name}</div>
              <div className="text-xs text-mocha italic font-serif">utforsk</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

