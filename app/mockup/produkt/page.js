import Link from "next/link"
import { mockProducts, stores, priceHistory, cheapestStore, categories } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"
import AddToCartButton from "../AddToCartButton"

export const metadata = { title: "Mockup · Produktdetalj" }

// Viser produkt 4 (Tine YT Protein) som har kampanje p\u00e5 Spar
export default function MockupProdukt() {
  const product = mockProducts.find(p => p.id === 4)
  const history = priceHistory(product.id)
  const cheapest = cheapestStore(product)
  const category = categories.find(c => c.slug === product.category)

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar active={product.category} />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <Breadcrumb category={category} product={product} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 sm:gap-12">
            <ProductImage product={product} />
            <ProductInfo product={product} cheapest={cheapest} />
          </div>

          <PriceHistoryChart history={history} />
          <CampaignLog product={product} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Breadcrumb({ category, product }) {
  return (
    <nav className="text-xs text-mocha mb-6">
      <Link href="/mockup/forside" className="hover:text-ink">Forside</Link>
      <span className="mx-2 text-rose-dusty">›</span>
      <Link href={`/mockup/a`} className="hover:text-ink">
        {category.name}
      </Link>
      <span className="mx-2 text-rose-dusty">›</span>
      <span className="italic font-serif text-ink">{product.name}</span>
    </nav>
  )
}

function ProductImage({ product }) {
  return (
    <div className="rounded-xl border border-rose-mist bg-blush-50 aspect-square flex items-center justify-center text-[14rem] relative overflow-hidden"
         style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}>
      <span aria-hidden>{product.emoji}</span>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rose-mist/30 to-transparent pointer-events-none" />
    </div>
  )
}

function ProductInfo({ product, cheapest }) {
  const cheapestStoreObj = stores.find(s => s.slug === cheapest.slug)

  return (
    <div className="flex flex-col">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3">
        ✿ Billigst hos {cheapestStoreObj.name}
      </p>
      <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink leading-tight">
        {product.name}
      </h1>
      <p className="mt-2 text-mocha">
        {product.size} · {product.meta}
      </p>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-serif italic text-5xl text-ink tabular-nums">
          {cheapest.price.toFixed(2).replace(".", ",")}
        </span>
        <span className="text-mocha text-sm">kr hos {cheapestStoreObj.name}</span>
      </div>
      <p className="text-sm text-mocha mt-1 tabular-nums">
        {product.pricePerUnit}
      </p>

      <div className="mt-8 space-y-2">
        {stores.map(s => {
          const p = product.prices[s.slug]
          if (!p) {
            return (
              <div key={s.slug} className="rounded-lg border border-rose-mist bg-blush-50/50 px-4 py-3 flex items-center justify-between">
                <span className="text-mocha">{s.name}</span>
                <span className="text-stone-300 tabular-nums">Ikke tilgjengelig</span>
              </div>
            )
          }
          const isCheapest = s.slug === cheapest.slug
          const has = !!p.campaign
          const show = has ? p.campaign.price : p.price
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
                  <div className={`font-medium ${isCheapest ? "text-ink" : "text-ink"}`}>
                    {s.name}
                  </div>
                  {has && (
                    <div className="text-[10px] uppercase tracking-wide text-ink bg-peach-soft/60 rounded-full px-2 py-0.5 inline-block mt-1">
                      ✦ {p.campaign.text}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2 tabular-nums">
                {has && (
                  <span className="text-xs text-mocha line-through">
                    {p.price.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <span className="font-semibold text-ink text-lg">
                  {show.toFixed(2).replace(".", ",")}
                </span>
                <a
                  href="#"
                  className="ml-3 text-xs text-mocha hover:text-rose-dusty whitespace-nowrap"
                  aria-label={`\u00c5pne hos ${s.name}`}
                >
                  Kjøp ↗
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <AddToCartButton productName={product.name} />
    </div>
  )
}

function PriceHistoryChart({ history }) {
  const width = 720
  const height = 240
  const pad = { t: 20, r: 20, b: 30, l: 40 }
  const all = history.flatMap(d => [d.oda, d.meny, d.spar])
  const min = Math.min(...all) - 1
  const max = Math.max(...all) + 1
  const n = history.length - 1

  const xAt = i => pad.l + (i / n) * (width - pad.l - pad.r)
  const yAt = v => pad.t + ((max - v) / (max - min)) * (height - pad.t - pad.b)

  const line = key => history.map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(d[key])}`).join(" ")

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

function CampaignLog({ product }) {
  const entries = [
    { date: "2026-04-19", text: "Spar startet kampanje −25%", store: "spar" },
    { date: "2026-04-05", text: "Oda endret ordinærpris til 38,90", store: "oda" },
    { date: "2026-03-22", text: "Meny avsluttet kampanje", store: "meny" },
  ]
  return (
    <section className="mt-12 max-w-xl">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
        Siste endringer
      </p>
      <h2 className="font-serif italic text-2xl text-ink mb-4">
        Kampanjelogg
      </h2>
      <ol className="space-y-3 border-l border-rose-mist pl-5">
        {entries.map((e, i) => {
          const store = stores.find(s => s.slug === e.store)
          return (
            <li key={i} className="relative">
              <span
                className="absolute -left-[23px] top-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: store.color }}
              />
              <div className="text-xs text-mocha tabular-nums">{e.date}</div>
              <div className="text-sm text-ink">{e.text}</div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
