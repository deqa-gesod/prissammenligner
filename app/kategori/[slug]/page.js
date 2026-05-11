import Link from "next/link"
import { notFound } from "next/navigation"
import sql from "../../lib/db"
import { groupByProduct } from "../../lib/queries"
import { categories } from "../../lib/categories"
import { hasCampaign, discountPercent, cheapestUnitPrice } from "../../lib/format"
import PriceTable from "../../components/PriceTable"
import SortSelect from "../../components/SortSelect"

export const revalidate = 60

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
  if (!category) notFound()

  const filter = VALID_FILTERS.has(sp?.filter) ? sp.filter : "alle"
  const sort = VALID_SORTS.has(sp?.sort) ? sp.sort : "alfabetisk"

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
    WHERE p.category = ${slug}
      AND ps.scraped_at = (
        SELECT MAX(scraped_at) FROM price_snapshot WHERE listing_id = l.id
      )
  `

  const allProducts = groupByProduct(rows).sort((a, b) =>
    a.name_norm.localeCompare(b.name_norm)
  )
  const products = sortProducts(filterProducts(allProducts, filter), sort)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 sm:px-10 sm:py-14">
      <Breadcrumb name={category.name} />
      <Header category={category} count={products.length} />
      <FilterBar slug={slug} filter={filter} sort={sort} />
      {products.length === 0 ? (
        <EmptyState filter={filter} sort={sort} />
      ) : (
        <PriceTable products={products} />
      )}
    </div>
  )
}

function Breadcrumb({ name }) {
  return (
    <nav className="text-[15px] text-mocha mb-6">
      <Link href="/" className="text-ink hover:text-rose-dusty hover:underline transition-colors">
        Forside
      </Link>
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

function EmptyState({ filter, sort }) {
  let title = "Ingen treff"
  let message
  if (sort === "rabatt") {
    title = "Ingen tilbud akkurat nå"
    message = "Ingen produkter i denne kategorien har kampanjepris akkurat nå. Skraperne henter nye priser hver 6. time."
  } else if (filter === "tilbud") {
    message = "Ingen aktive tilbud i denne kategorien akkurat nå."
  } else if (filter === "alle-butikker") {
    message = "Ingen produkter finnes i alle tre butikker akkurat nå."
  } else {
    message = "Skraperne har ikke registrert produkter i denne kategorien ennå."
  }
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="text-5xl mb-4 text-rose-dusty" aria-hidden>✿</div>
      <h2 className="font-serif italic text-2xl text-ink mb-2">{title}</h2>
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
    // Sortér på pris per enhet (kr/l eller kr/kg) — mer rettferdig enn total pris
    return [...products].sort((a, b) => cheapestUnitPrice(a) - cheapestUnitPrice(b))
  }
  if (sort === "rabatt") {
    // Vis kun produkter som faktisk har kampanje, sortér på største rabatt
    return products
      .filter(p => p.listings.some(hasCampaign))
      .sort((a, b) => discountPercent(b) - discountPercent(a))
  }
  return products
}

