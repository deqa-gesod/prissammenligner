import Link from "next/link"
import { mockProducts, stores, mockCart, cartTotals } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"

// Kjøpsoversikt — vises når brukeren klikker "Klar til å handle?" på /handleliste.
// Bruker velger butikk på handleliste; her viser vi listen med pris hos valgt butikk.
export default async function MockupKjop({ searchParams }) {
  const params = await searchParams
  const { totals } = cartTotals(mockCart)
  const cheapestSlug = stores.reduce((min, s) => (totals[s.slug] < totals[min] ? s.slug : min), stores[0].slug)
  const selectedSlug = stores.some(s => s.slug === params?.store) ? params.store : cheapestSlug
  const selected = stores.find(s => s.slug === selectedSlug)
  const otherStores = stores.filter(s => s.slug !== selectedSlug).sort((a, b) => totals[a.slug] - totals[b.slug])

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <Breadcrumb />
          <Header store={selected} total={totals[selectedSlug]} isCheapest={selectedSlug === cheapestSlug} />
          <ItemList store={selected} />
          <SwitchStore otherStores={otherStores} totals={totals} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Breadcrumb() {
  return (
    <nav className="text-xs text-mocha mb-6">
      <Link href="/mockup/handleliste" className="hover:text-ink">Handleliste</Link>
      <span className="mx-2 text-rose-dusty">›</span>
      <span className="italic font-serif text-ink">Kjøpsoversikt</span>
    </nav>
  )
}

function Header({ store, total, isCheapest }) {
  return (
    <header className="mb-10 text-center">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3">
        {isCheapest ? "✿ Beste valg" : "Ditt valg"}
      </p>
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink leading-tight">
        Klar til å handle hos {store.name}
      </h1>
      <div className="mt-4 inline-block h-px w-16 bg-rose-dusty" />
      <p className="mt-6 text-mocha max-w-md mx-auto text-sm">
        Klikk på et produkt for å åpne det hos {store.name} og legge det
        i deres handlekurv.
      </p>

      <div className={`mt-8 inline-flex items-baseline gap-2 rounded-full px-6 py-3 border ${isCheapest ? "bg-mint-soft/30 border-mint-soft" : "bg-blush-50 border-rose-mist"}`}>
        {isCheapest && <span className="text-rose-dusty">✿</span>}
        <span className="font-serif italic text-mocha text-sm">Totalt</span>
        <span className="font-semibold text-ink text-2xl tabular-nums">
          {total.toFixed(2).replace(".", ",")}
        </span>
        <span className="text-xs text-mocha">kr</span>
      </div>
    </header>
  )
}

function ItemList({ store }) {
  return (
    <div
      className="rounded-xl border border-rose-mist bg-blush-50 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="px-6 py-4 border-b border-rose-mist">
        <span className="text-xs uppercase tracking-wider text-mocha">
          {mockCart.length} produkter
        </span>
      </div>

      {mockCart.map((item, idx) => {
        const product = mockProducts.find(p => p.id === item.productId)
        return (
          <Item
            key={item.productId}
            product={product}
            quantity={item.quantity}
            store={store}
            last={idx === mockCart.length - 1}
          />
        )
      })}
    </div>
  )
}

function Item({ product, quantity, store, last }) {
  const priceData = product.prices[store.slug]
  const unitPrice = priceData.campaign ? priceData.campaign.price : priceData.price
  const lineTotal = unitPrice * quantity

  return (
    <a
      href="#"
      target="_blank"
      rel="noopener"
      className={`group grid grid-cols-[auto_1fr_auto] gap-4 p-5 items-center hover:bg-cream/50 transition-colors ${
        last ? "" : "border-b border-rose-mist"
      }`}
    >
      <div className="w-14 h-14 rounded-lg bg-white border border-rose-mist flex items-center justify-center text-3xl flex-shrink-0">
        <span aria-hidden>{product.emoji}</span>
      </div>

      <div className="min-w-0">
        <h3 className="font-medium text-ink truncate">{product.name}</h3>
        <p className="text-sm text-mocha">
          {product.size} · {product.meta} · <span className="tabular-nums">{quantity} stk</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right tabular-nums">
          <div className="text-xs text-mocha">
            {unitPrice.toFixed(2).replace(".", ",")} × {quantity}
          </div>
          <div className="font-semibold text-ink">
            {lineTotal.toFixed(2).replace(".", ",")} kr
          </div>
        </div>
        <span className="text-sky-soft text-xl group-hover:translate-x-0.5 transition-transform">
          ↗
        </span>
      </div>
    </a>
  )
}

function SwitchStore({ otherStores, totals }) {
  return (
    <section className="mt-10">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
        Eller
      </p>
      <h2 className="font-serif italic text-xl text-ink mb-4">
        Bytt butikk
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {otherStores.map(s => (
          <Link
            key={s.slug}
            href={`/mockup/kjop?store=${s.slug}`}
            className="rounded-xl border border-rose-mist bg-blush-50 p-4 flex items-center justify-between hover:border-rose-dusty transition-colors"
          >
            <div>
              <div className="font-medium text-ink">{s.name}</div>
              <div className="text-xs text-mocha">Bytt for å handle her i stedet</div>
            </div>
            <div className="text-right tabular-nums">
              <div className="text-mocha text-xs">Totalt</div>
              <div className="font-semibold text-ink">
                {totals[s.slug].toFixed(2).replace(".", ",")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
