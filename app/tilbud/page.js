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
  discountPercent,
} from "../lib/format"

export const revalidate = 0

export const metadata = {
  title: "Tilbud · Prissammenligner",
}

const VALID_CATEGORY_SLUGS = new Set(categories.map(c => c.slug))

export default async function TilbudPage({ searchParams }) {
  const sp = await searchParams
  const categorySlug = VALID_CATEGORY_SLUGS.has(sp?.kategori) ? sp.kategori : null

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
    WHERE ps.scraped_at = (
      SELECT MAX(scraped_at) FROM price_snapshot WHERE listing_id = l.id
    )
  `

  const deals = groupByProduct(rows)
    .filter(p => p.listings.some(hasCampaign))
    .filter(p => !categorySlug || p.category === categorySlug)
    .sort((a, b) => discountPercent(b) - discountPercent(a))

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <Header count={deals.length} />
      <CategoryFilter current={categorySlug} />
      {deals.length === 0 ? (
        <EmptyState categorySlug={categorySlug} />
      ) : (
        <DealGrid deals={deals} />
      )}
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
        {count} {count === 1 ? "produkt" : "produkter"} med kampanjepris, sortert etter{" "}
        <span className="italic font-serif text-ink">størst rabatt først</span>.
      </p>
    </header>
  )
}

function CategoryFilter({ current }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 text-sm overflow-x-auto">
      <Chip href="/tilbud" active={!current}>Alle kategorier</Chip>
      {categories.map(c => (
        <Chip
          key={c.slug}
          href={`/tilbud?kategori=${c.slug}`}
          active={current === c.slug}
        >
          <span className="mr-1">{c.emoji}</span>
          {c.name}
        </Chip>
      ))}
    </div>
  )
}

function Chip({ href, active, children }) {
  const base = "rounded-full px-4 py-2 border transition-colors whitespace-nowrap"
  const on = "bg-rose-dusty text-white border-rose-dusty"
  const off = "bg-blush-50 text-mocha border-rose-mist hover:border-rose-dusty"
  return (
    <Link href={href} className={`${base} ${active ? on : off}`}>
      {children}
    </Link>
  )
}

function DealGrid({ deals }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {deals.map(p => <DealCard key={p.id} product={p} />)}
    </div>
  )
}

function DealCard({ product }) {
  const cheapest = cheapestListing(product)
  const pct = discountPercent(product)
  const category = categories.find(c => c.slug === product.category)
  const emoji = category?.emoji ?? "🛒"
  const sample = product.listings[0]

  return (
    <Link
      href={`/produkt/${product.id}`}
      className="group rounded-xl border border-rose-mist bg-blush-50 p-5 flex flex-col gap-4 hover:border-rose-dusty transition-colors"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="relative aspect-square rounded-lg bg-white flex items-center justify-center text-7xl border border-rose-mist">
        <span aria-hidden>{emoji}</span>
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
        <h3 className="font-medium text-ink">{displayName(product)}</h3>
        {sample?.size && (
          <p className="text-sm text-mocha">{formatSize(sample)}</p>
        )}
      </div>

      <div className="space-y-2">
        {stores.map(s => {
          const listing = product.listings.find(l => l.store_slug === s.slug)
          if (!listing) {
            return (
              <div key={s.slug} className="flex justify-between items-center text-sm">
                <span className="text-mocha">{s.name}</span>
                <span className="text-stone-300 tabular-nums">—</span>
              </div>
            )
          }
          const isCheapest = s.slug === cheapest?.store_slug
          const has = hasCampaign(listing)
          const show = effectivePrice(listing)
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
                    {formatKr(listing.price)}
                  </span>
                )}
                <span className={`${isCheapest ? "font-semibold" : ""} text-ink`}>
                  {formatKr(show)}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      {sample?.price_per_unit && (
        <div className="pt-3 border-t border-rose-mist flex items-center justify-between text-xs text-mocha">
          <span className="italic font-serif">Pris per enhet</span>
          <span className="tabular-nums">{formatPricePerUnit(sample)}</span>
        </div>
      )}
    </Link>
  )
}

function EmptyState({ categorySlug }) {
  const category = categorySlug ? categories.find(c => c.slug === categorySlug) : null
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="text-5xl mb-4 text-rose-dusty" aria-hidden>✿</div>
      <h2 className="font-serif italic text-2xl text-ink mb-2">Ingen tilbud akkurat nå</h2>
      <p className="text-mocha text-sm max-w-md mx-auto">
        {category
          ? `Ingen aktive kampanjer i ${category.name} akkurat nå. Skraperne henter nye priser hver 6. time.`
          : "Ingen aktive kampanjer akkurat nå. Skraperne henter nye priser hver 6. time — sjekk tilbake snart."}
      </p>
    </div>
  )
}
