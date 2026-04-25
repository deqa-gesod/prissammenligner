import { mockProducts, stores, cheapestStore, storesCarrying } from "../mock-data"

export const metadata = { title: "Mockup B · Kort" }

export default function MockupB() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:px-10 sm:py-16">
        <Header />
        <FilterBar />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        <SectionDivider label="Laste-tilstand" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <SectionDivider label="Tom tilstand (filter gir 0 treff)" />
        <EmptyState />
      </div>
    </main>
  )
}

function Header() {
  return (
    <header className="mb-10">
      <h1 className="font-serif italic font-light text-5xl sm:text-6xl text-ink">
        Prissammenligner
      </h1>
      <div className="mt-3 h-px w-16 bg-rose-dusty" />
      <p className="mt-4 text-mocha text-sm">
        Sammenlign priser på meieri fra Oda, Meny og Spar.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mocha text-sm">⌕</span>
          <input
            type="text"
            placeholder="Søk melk, ost, smør…"
            className="w-full rounded-full border border-rose-mist bg-blush-50 pl-10 pr-4 py-3 text-sm placeholder:text-mocha focus:outline-none focus:border-rose-dusty"
          />
        </div>
      </div>
    </header>
  )
}

function FilterBar() {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
      <Chip active>Alle</Chip>
      <Chip>Kun tilbud</Chip>
      <Chip>Finnes i alle butikker</Chip>
      <div className="ml-auto text-mocha">
        Sorter: <span className="italic font-serif text-ink">Alfabetisk</span>
      </div>
    </div>
  )
}

function Chip({ children, active }) {
  const base = "rounded-full px-4 py-2 border transition-colors"
  const on = "bg-rose-dusty text-white border-rose-dusty"
  const off = "bg-blush-50 text-mocha border-rose-mist hover:border-rose-dusty"
  return <button className={`${base} ${active ? on : off}`}>{children}</button>
}

function ProductCard({ product }) {
  const cheapest = cheapestStore(product)
  const carrying = storesCarrying(product)
  const onlyInOne = carrying.length === 1
  const anyCampaign = stores.some(s => product.prices[s.slug]?.campaign)

  return (
    <article
      className="rounded-xl border border-rose-mist bg-blush-50 p-6 flex flex-col gap-4"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="relative aspect-square rounded-lg bg-white flex items-center justify-center text-6xl border border-rose-mist">
        <span aria-hidden>{product.emoji}</span>
        {anyCampaign && (
          <span className="absolute top-3 left-3 rounded-full bg-peach-soft/80 text-ink text-[10px] uppercase tracking-wide px-3 py-1">
            ✦ Tilbud
          </span>
        )}
        {onlyInOne && (
          <span className="absolute top-3 right-3 rounded-full bg-lavender-soft/50 text-ink text-[10px] italic font-serif px-3 py-1">
            Kun hos {carrying[0].name}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-medium text-ink">{product.name}</h3>
        <p className="text-sm text-mocha">{product.size} · {product.meta}</p>
      </div>

      <ul className="space-y-2">
        {stores.map(s => (
          <PriceRow
            key={s.slug}
            store={s}
            product={product}
            isCheapest={cheapest?.slug === s.slug}
          />
        ))}
      </ul>

      <div className="pt-2 border-t border-rose-mist text-xs text-mocha flex justify-between tabular-nums">
        <span className="italic font-serif">Pris per enhet</span>
        <span>{product.pricePerUnit}</span>
      </div>
    </article>
  )
}

function PriceRow({ store, product, isCheapest }) {
  const p = product.prices[store.slug]
  if (!p) {
    return (
      <li className="flex justify-between items-center text-sm tabular-nums">
        <span className="text-mocha">{store.name}</span>
        <span className="text-stone-300">—</span>
      </li>
    )
  }
  const hasCampaign = !!p.campaign
  const displayPrice = hasCampaign ? p.campaign.price : p.price
  const rowStyle = isCheapest
    ? "bg-mint-soft/40 rounded-lg -mx-2 px-2 py-1"
    : ""
  return (
    <li className={`flex justify-between items-center text-sm ${rowStyle}`}>
      <span className="flex items-center gap-2">
        {isCheapest && <span className="text-rose-dusty" aria-label="Billigst">✿</span>}
        <span className={isCheapest ? "font-medium text-ink" : "text-mocha"}>
          {store.name}
        </span>
      </span>
      <span className="flex items-center gap-2 tabular-nums">
        {hasCampaign && (
          <span className="text-xs text-mocha line-through">
            {p.price.toFixed(2).replace(".", ",")}
          </span>
        )}
        <span className={`${isCheapest ? "font-semibold text-ink" : "text-ink"} text-base`}>
          {displayPrice.toFixed(2).replace(".", ",")}
        </span>
      </span>
    </li>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-rose-mist bg-blush-50 p-6 animate-pulse">
      <div className="aspect-square rounded-lg bg-rose-mist/60 mb-4" />
      <div className="h-4 w-3/4 bg-rose-mist rounded mb-2" />
      <div className="h-3 w-1/2 bg-rose-mist/70 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-rose-mist/60 rounded" />
        <div className="h-4 bg-rose-mist/60 rounded" />
        <div className="h-4 bg-rose-mist/60 rounded" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="text-5xl mb-4" aria-hidden>✿</div>
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
    <div className="mt-16 mb-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-rose-mist" />
        <span className="text-xs uppercase tracking-wider text-mocha font-serif italic">{label}</span>
        <div className="h-px flex-1 bg-rose-mist" />
      </div>
    </div>
  )
}
