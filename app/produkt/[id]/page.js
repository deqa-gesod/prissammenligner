import Link from "next/link"
import { notFound } from "next/navigation"
import sql from "../../lib/db"
import { groupByProduct } from "../../lib/queries"
import { categories } from "../../lib/categories"
import { stores } from "../../lib/stores"
import {
  formatKr,
  formatSize,
  formatPricePerUnit,
  cheapestListing,
  displayName,
  hasCampaign,
  effectivePrice,
} from "../../lib/format"
import AddToCartButton from "../../components/AddToCartButton"

export const revalidate = 60

export async function generateMetadata({ params }) {
  const { id } = await params
  const rows = await sql`SELECT name_norm FROM product WHERE id = ${id}`
  if (rows.length === 0) return { title: "Prissammenligner" }
  return { title: `${rows[0].name_norm} · Prissammenligner` }
}

export default async function ProduktPage({ params }) {
  const { id } = await params
  const productId = Number.parseInt(id, 10)
  if (!Number.isFinite(productId)) notFound()

  const productRows = await sql`
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
    WHERE p.id = ${productId}
      AND ps.scraped_at = (
        SELECT MAX(scraped_at) FROM price_snapshot WHERE listing_id = l.id
      )
  `

  if (productRows.length === 0) notFound()

  const historyRows = await sql`
    SELECT
      DATE(ps.scraped_at) AS day,
      s.slug AS store_slug,
      MIN(COALESCE(ps.campaign_price, ps.price))::float AS price
    FROM price_snapshot ps
    JOIN listing l ON l.id = ps.listing_id
    JOIN store s ON s.id = l.store_id
    WHERE l.product_id = ${productId}
      AND ps.scraped_at >= NOW() - INTERVAL '30 days'
    GROUP BY day, s.slug
    ORDER BY day, s.slug
  `

  const product = groupByProduct(productRows)[0]
  const category = categories.find(c => c.slug === product.category)
  const cheapest = cheapestListing(product)
  const history = buildHistory(historyRows)

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <Breadcrumb category={category} product={product} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 sm:gap-12">
        <ProductImage emoji={category?.emoji ?? "🛒"} />
        <ProductInfo product={product} cheapest={cheapest} />
      </div>

      <div className="mt-8">
        <AddToCartButton productId={product.id} productName={displayName(product)} />
      </div>

      {history.some(d => d.oda != null || d.meny != null || d.spar != null) && (
        <PriceHistoryChart history={history} />
      )}
    </div>
  )
}

function Breadcrumb({ category, product }) {
  return (
    <nav className="text-[15px] text-mocha mb-6">
      <Link href="/" className="text-ink hover:text-rose-dusty hover:underline transition-colors">
        Forside
      </Link>
      <span className="mx-2 text-rose-dusty">›</span>
      {category ? (
        <>
          <Link
            href={`/kategori/${category.slug}`}
            className="text-ink hover:text-rose-dusty hover:underline transition-colors"
          >
            {category.name}
          </Link>
          <span className="mx-2 text-rose-dusty">›</span>
        </>
      ) : null}
      <span className="italic font-serif text-ink">{displayName(product)}</span>
    </nav>
  )
}

function ProductImage({ emoji }) {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 aspect-square flex items-center justify-center text-[14rem] relative overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <span aria-hidden>{emoji}</span>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rose-mist/30 to-transparent pointer-events-none" />
    </div>
  )
}

function ProductInfo({ product, cheapest }) {
  const cheapestStoreObj = cheapest ? stores.find(s => s.slug === cheapest.store_slug) : null
  const sample = product.listings[0]

  return (
    <div className="flex flex-col">
      {cheapestStoreObj && (
        <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3">
          ✿ Billigst hos {cheapestStoreObj.name}
        </p>
      )}
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink leading-tight">
        {displayName(product)}
      </h1>
      {sample?.size && (
        <p className="mt-2 text-mocha">
          {formatSize(sample)}
        </p>
      )}

      {cheapest && cheapestStoreObj && (
        <>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif italic text-5xl text-ink tabular-nums">
              {formatKr(cheapest.effective)}
            </span>
            <span className="text-mocha text-sm">kr hos {cheapestStoreObj.name}</span>
          </div>
          {sample?.price_per_unit && (
            <p className="text-sm text-mocha mt-1 tabular-nums">
              {formatPricePerUnit(sample)}
            </p>
          )}
        </>
      )}

      <div className="mt-8 space-y-2">
        {stores.map(s => {
          const listing = product.listings.find(l => l.store_slug === s.slug)
          if (!listing) {
            return (
              <div key={s.slug} className="rounded-lg border border-rose-mist bg-blush-50/50 px-4 py-3 flex items-center justify-between">
                <span className="text-mocha">{s.name}</span>
                <span className="text-stone-300 tabular-nums">Ikke tilgjengelig</span>
              </div>
            )
          }
          const isCheapest = s.slug === cheapest?.store_slug
          const has = hasCampaign(listing)
          const show = effectivePrice(listing)
          return (
            <div
              key={s.slug}
              className={`rounded-lg border px-4 py-3 flex items-center justify-between ${
                isCheapest
                  ? "border-rose-dusty bg-mint-soft/30"
                  : "border-rose-mist bg-blush-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {isCheapest && <span className="text-rose-dusty text-lg">✿</span>}
                <div>
                  <div className="font-medium text-ink">{s.name}</div>
                  {has && listing.campaign_text && (
                    <div className="text-[10px] uppercase tracking-wide text-ink bg-peach-soft/60 rounded-full px-2 py-0.5 inline-block mt-1">
                      ✦ {listing.campaign_text}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2 tabular-nums">
                {has && (
                  <span className="text-xs text-mocha line-through">
                    {formatKr(listing.price)}
                  </span>
                )}
                <span className="font-semibold text-ink text-lg">
                  {formatKr(show)}
                </span>
                {listing.url && (
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-xs text-mocha hover:text-rose-dusty whitespace-nowrap"
                    aria-label={`Åpne hos ${s.name}`}
                  >
                    Kjøp ↗
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PriceHistoryChart({ history }) {
  const width = 720
  const height = 240
  const pad = { t: 20, r: 20, b: 30, l: 40 }
  const all = history.flatMap(d => [d.oda, d.meny, d.spar]).filter(v => v != null)
  if (all.length === 0) return null
  const min = Math.min(...all) - 1
  const max = Math.max(...all) + 1
  const n = history.length - 1

  const xAt = i => pad.l + (i / n) * (width - pad.l - pad.r)
  const yAt = v => pad.t + ((max - v) / (max - min)) * (height - pad.t - pad.b)

  const line = key => {
    const segments = []
    let isFirst = true
    for (let i = 0; i < history.length; i++) {
      const v = history[i][key]
      if (v == null) {
        isFirst = true
        continue
      }
      segments.push(`${isFirst ? "M" : "L"} ${xAt(i)} ${yAt(v)}`)
      isFirst = false
    }
    return segments.join(" ")
  }

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
            Siste 30 dager
          </p>
          <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">
            Prishistorikk
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {stores.map(s => (
            <div key={s.slug} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-mocha">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border border-rose-mist bg-blush-50 p-4 sm:p-6"
        style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label="Prishistorikk-graf siste 30 dager"
        >
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const y = pad.t + f * (height - pad.t - pad.b)
            const v = max - f * (max - min)
            return (
              <g key={f}>
                <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="#F5E1DC" strokeWidth="1" />
                <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#8B7B6F">
                  {v.toFixed(0)}
                </text>
              </g>
            )
          })}

          {stores.map(s => (
            <path
              key={s.slug}
              d={line(s.slug)}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {[0, Math.floor(n / 2), n].map(i => (
            <text
              key={i}
              x={xAt(i)}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#8B7B6F"
            >
              {history[i].date.slice(5)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  )
}

function buildHistory(rows, days = 30) {
  const map = new Map()
  for (const r of rows) {
    const key = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day)
    if (!map.has(key)) map.set(key, { date: key })
    map.get(key)[r.store_slug] = r.price
  }

  const result = []
  const today = new Date()
  const last = { oda: null, meny: null, spar: null }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const dayData = map.get(key) || {}
    const point = { date: key }
    for (const slug of ["oda", "meny", "spar"]) {
      if (dayData[slug] != null) {
        last[slug] = dayData[slug]
        point[slug] = dayData[slug]
      } else {
        point[slug] = last[slug]
      }
    }
    result.push(point)
  }
  return result
}

