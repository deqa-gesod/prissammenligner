import { mockProducts, stores, cheapestStore, storesCarrying } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"

export const metadata = { title: "Mockup · Kategori (Meieri)" }

export default function MockupKategori() {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar active="meieri" />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10 sm:px-10 sm:py-14">
          <Breadcrumb />
          <Header />
          <FilterBar />
          <PriceTable products={mockProducts.filter(p => p.category === "meieri")} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Breadcrumb() {
  return (
    <nav className="text-xs text-mocha mb-4">
      <span>Forside</span>
      <span className="mx-2 text-rose-dusty">›</span>
      <span className="italic font-serif text-ink">Meieri</span>
    </nav>
  )
}

function Header() {
  return (
    <header className="mb-8">
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink">
        Meieri
      </h1>
      <div className="mt-3 h-px w-16 bg-rose-dusty" />
      <p className="mt-4 text-mocha text-sm">
        42 produkter · sist oppdatert for 2 timer siden
      </p>
    </header>
  )
}

function FilterBar() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <Chip active>Alle</Chip>
      <Chip>Kun tilbud</Chip>
      <Chip>Finnes i alle butikker</Chip>
      <div className="ml-auto text-mocha text-xs flex items-center gap-2">
        <span>Sorter:</span>
        <select
          className="rounded-full bg-blush-50 border border-rose-mist px-3 py-1 text-ink text-xs focus:outline-none focus:border-rose-dusty"
          defaultValue="alfabetisk"
        >
          <option value="alfabetisk">Alfabetisk</option>
          <option value="billigst">Billigste pris</option>
          <option value="rabatt">Størst rabatt</option>
        </select>
      </div>
    </div>
  )
}

function Chip({ children, active }) {
  const base = "rounded-full px-4 py-2 border transition-colors text-sm"
  const on = "bg-rose-dusty text-white border-rose-dusty"
  const off = "bg-blush-50 text-mocha border-rose-mist hover:border-rose-dusty"
  return <button className={`${base} ${active ? on : off}`}>{children}</button>
}

function PriceTable({ products, loading }) {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 px-6 py-4 border-b border-rose-mist text-xs uppercase tracking-wider text-mocha">
        <div>Produkt</div>
        <div className="text-center">Oda</div>
        <div className="text-center">Meny</div>
        <div className="text-center">Spar</div>
        <div className="text-right">Pris/enhet</div>
      </div>

      {loading && (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      )}
      {!loading && products?.map(p => <ProductRow key={p.id} product={p} />)}
    </div>
  )
}

function ProductRow({ product }) {
  const cheapest = cheapestStore(product)
  const carrying = storesCarrying(product)
  const onlyInOne = carrying.length === 1

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-5 border-b border-rose-mist last:border-b-0 items-center hover:bg-cream/50 transition-colors">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>{product.emoji}</span>
          <div>
            <div className="font-medium text-ink">{product.name}</div>
            <div className="text-sm text-mocha">
              {product.size} · {product.meta}
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-2 flex-wrap sm:hidden">
          {stores.map(s => (
            <MobilePriceChip key={s.slug} store={s} product={product} isCheapest={cheapest?.slug === s.slug} />
          ))}
        </div>
        {onlyInOne && (
          <div className="mt-2 inline-block rounded-full px-3 py-1 text-xs italic font-serif bg-lavender-soft/40 text-ink">
            Kun hos {carrying[0].name}
          </div>
        )}
      </div>

      {stores.map(s => (
        <div key={s.slug} className="hidden sm:block">
          <PriceCell store={s} product={product} isCheapest={cheapest?.slug === s.slug} />
        </div>
      ))}

      <div className="hidden sm:block text-right text-sm text-mocha tabular-nums">
        {product.pricePerUnit}
      </div>
    </div>
  )
}

function PriceCell({ store, product, isCheapest }) {
  const p = product.prices[store.slug]
  if (!p) {
    return <div className="text-center text-stone-300 tabular-nums">—</div>
  }
  const hasCampaign = !!p.campaign
  const displayPrice = hasCampaign ? p.campaign.price : p.price
  const bg = isCheapest ? "bg-mint-soft/40" : ""
  return (
    <div className={`rounded-lg py-2 px-3 text-center ${bg}`}>
      <div className="flex items-center justify-center gap-1 tabular-nums">
        {isCheapest && <span className="text-rose-dusty" aria-label="Billigst">✿</span>}
        <span className="font-semibold text-ink">
          {displayPrice.toFixed(2).replace(".", ",")}
        </span>
      </div>
      {hasCampaign && (
        <div className="text-[10px] text-mocha line-through tabular-nums mt-0.5">
          {p.price.toFixed(2).replace(".", ",")}
        </div>
      )}
      {hasCampaign && (
        <div className="mt-1 text-[10px] uppercase tracking-wide text-ink bg-peach-soft/60 rounded-full px-2 py-0.5 inline-block">
          {p.campaign.text}
        </div>
      )}
    </div>
  )
}

function MobilePriceChip({ store, product, isCheapest }) {
  const p = product.prices[store.slug]
  if (!p) {
    return (
      <span className="rounded-full border border-rose-mist px-3 py-1 text-xs text-stone-300 tabular-nums">
        {store.name} —
      </span>
    )
  }
  const hasCampaign = !!p.campaign
  const displayPrice = hasCampaign ? p.campaign.price : p.price
  const style = isCheapest
    ? "bg-mint-soft/40 text-ink"
    : "bg-blush-50 border border-rose-mist text-ink"
  return (
    <span className={`rounded-full px-3 py-1 text-xs tabular-nums ${style}`}>
      {isCheapest && <span className="text-rose-dusty mr-1">✿</span>}
      {store.name} {displayPrice.toFixed(2).replace(".", ",")}
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-5 border-b border-rose-mist items-center">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-rose-dusty/25" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-rose-dusty/25 rounded" />
          <div className="h-3 w-24 bg-rose-dusty/20 rounded" />
        </div>
      </div>
      <div className="hidden sm:block h-8 bg-rose-dusty/25 rounded-lg animate-pulse" />
      <div className="hidden sm:block h-8 bg-rose-dusty/25 rounded-lg animate-pulse" style={{ animationDelay: "100ms" }} />
      <div className="hidden sm:block h-8 bg-rose-dusty/25 rounded-lg animate-pulse" style={{ animationDelay: "200ms" }} />
      <div className="hidden sm:block h-4 w-16 bg-rose-dusty/20 rounded ml-auto animate-pulse" />
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="text-5xl mb-4 text-rose-dusty" aria-hidden>✿</div>
      <h2 className="font-serif italic text-2xl text-ink mb-2">Ingen treff</h2>
      <p className="text-mocha text-sm max-w-sm mx-auto mb-6">
        Vi fant ingen produkter som matcher filteret ditt. Prøv å fjerne et filter eller søk etter noe annet.
      </p>
      <button className="rounded-full bg-rose-dusty text-white px-6 py-2 text-sm hover:bg-rose-dusty/90 transition-colors">
        Tøm filter
      </button>
    </div>
  )
}

function SectionDivider({ label }) {
  return (
    <div className="mt-16 mb-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-rose-mist" />
      <span className="text-xs uppercase tracking-wider text-mocha font-serif italic">
        {label}
      </span>
      <div className="h-px flex-1 bg-rose-mist" />
    </div>
  )
}
