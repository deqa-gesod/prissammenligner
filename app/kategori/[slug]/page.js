import Link from "next/link"
import { notFound } from "next/navigation"
import sql from "../../lib/db"
import { categories } from "../../lib/categories"
import { hasCampaign, discountPercent } from "../../lib/format"
import PriceTable from "../../components/PriceTable"
import SortSelect from "../../components/SortSelect"

export const revalidate = 0

export async function generateMetadata({ params }) {
  const { slug } = await params
  const category = categories.find(c => c.slug === slug)
  return { title: category ? `${category.name} · Prissammenligner` : "Prissammenligner" }
}

const VALID_FILTERS = new Set(["alle", "tilbud", "alle-butikker"])
const VALID_SORTS = new Set(["alfabetisk", "billigst", "rabatt"])

export default async function KategoriPage({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams

  const category = categories.find(c => c.slug === slug)
  if (!category || !category.enabled) notFound()

  const filter = VALID_FILTERS.has(sp?.filter) ? sp.filter : "alle"
  const sort = VALID_SORTS.has(sp?.sort) ? sp.sort : "alfabetisk"

  const allProducts = await sql`
    SELECT
      p.id,
      p.name_norm,
      p.category,
      json_agg(
        json_build_object(
          'store_slug', s.slug,
          'name_raw', r.name_raw,
          'price', r.price::float,
          'price_per_unit', r.price_per_unit::float,
          'campaign_price', r.campaign_price::float,
          'campaign_text', r.campaign_text,
          'url', r.url,
          'unit', r.unit,
          'size', r.size::float
        ) ORDER BY s.slug
      ) AS listings
    FROM product p
    JOIN (
      SELECT DISTINCT ON (l.product_id, l.store_id)
        l.product_id, l.store_id, l.name_raw, l.url, l.unit, l.size,
        ps.price, ps.price_per_unit, ps.campaign_price, ps.campaign_text
      FROM listing l
      CROSS JOIN LATERAL (
        SELECT price, price_per_unit, campaign_price, campaign_text
        FROM price_snapshot
        WHERE listing_id = l.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) ps
      ORDER BY l.product_id, l.store_id, l.last_seen_at DESC NULLS LAST, l.id
    ) r ON r.product_id = p.id
    JOIN store s ON s.id = r.store_id
    WHERE p.category = ${slug}
    GROUP BY p.id, p.name_norm, p.category
    ORDER BY p.name_norm
  `

  const products = sortProducts(filterProducts(allProducts, filter), sort)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 sm:px-10 sm:py-14">
      <Breadcrumb name={category.name} />
      <Header category={category} count={products.length} />
      <FilterBar slug={slug} filter={filter} sort={sort} />
      {products.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <PriceTable products={products} />
      )}
    </div>
  )
}

function Breadcrumb({ name }) {
  return (
    <nav className="text-xs text-mocha mb-4">
      <Link href="/" className="hover:text-ink">Forside</Link>
      <span className="mx-2 text-rose-dusty">›</span>
      <span className="italic font-serif text-ink">{name}</span>
    </nav>
  )
}

function Header({ category, count }) {
  return (
    <header className="mb-8">
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink">
        {category.name}
      </h1>
      <div className="mt-3 h-px w-16 bg-rose-dusty" />
      <p className="mt-4 text-mocha text-sm">
        {count} {count === 1 ? "produkt" : "produkter"}
      </p>
    </header>
  )
}

function FilterBar({ slug, filter, sort }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <FilterChip slug={slug} sort={sort} target="alle" current={filter}>
        Alle
      </FilterChip>
      <FilterChip slug={slug} sort={sort} target="tilbud" current={filter}>
        Kun tilbud
      </FilterChip>
      <FilterChip slug={slug} sort={sort} target="alle-butikker" current={filter}>
        Finnes i alle butikker
      </FilterChip>
      <div className="ml-auto text-mocha text-xs flex items-center gap-2">
        <span>Sorter:</span>
        <SortSelect value={sort} />
      </div>
    </div>
  )
}

function FilterChip({ slug, sort, target, current, children }) {
  const params = new URLSearchParams()
  if (target !== "alle") params.set("filter", target)
  if (sort !== "alfabetisk") params.set("sort", sort)
  const qs = params.toString()
  const href = qs ? `/kategori/${slug}?${qs}` : `/kategori/${slug}`

  const active = current === target
  const base = "rounded-full px-4 py-2 border text-sm transition-colors"
  const on = "bg-rose-dusty text-white border-rose-dusty"
  const off = "bg-blush-50 text-mocha border-rose-mist hover:border-rose-dusty"

  return (
    <Link href={href} className={`${base} ${active ? on : off}`}>
      {children}
    </Link>
  )
}

function EmptyState({ filter }) {
  const message =
    filter === "tilbud"
      ? "Ingen aktive tilbud i denne kategorien akkurat nå."
      : filter === "alle-butikker"
        ? "Ingen produkter finnes i alle tre butikker akkurat nå."
        : "Skraperne har ikke registrert produkter i denne kategorien ennå."
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="text-5xl mb-4 text-rose-dusty" aria-hidden>✿</div>
      <h2 className="font-serif italic text-2xl text-ink mb-2">Ingen treff</h2>
      <p className="text-mocha text-sm max-w-sm mx-auto">{message}</p>
    </div>
  )
}

function filterProducts(products, filter) {
  if (filter === "tilbud") {
    return products.filter(p => p.listings.some(hasCampaign))
  }
  if (filter === "alle-butikker") {
    return products.filter(p => p.listings.length === 3)
  }
  return products
}

function sortProducts(products, sort) {
  if (sort === "billigst") {
    return [...products].sort((a, b) => effectiveMin(a) - effectiveMin(b))
  }
  if (sort === "rabatt") {
    return [...products].sort((a, b) => discountPercent(b) - discountPercent(a))
  }
  return products
}

function effectiveMin(product) {
  let min = Infinity
  for (const l of product.listings) {
    const p = hasCampaign(l) ? l.campaign_price : l.price
    if (p < min) min = p
  }
  return min
}

