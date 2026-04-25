import Link from "next/link"
import { stores } from "../lib/stores"
import { categories } from "../lib/categories"
import {
  formatKr,
  formatSize,
  formatPricePerUnit,
  cheapestListing,
  displayName,
  hasCampaign,
  effectivePrice,
} from "../lib/format"

export default function PriceTable({ products }) {
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

      {products.map(p => <ProductRow key={p.id} product={p} />)}
    </div>
  )
}

function ProductRow({ product }) {
  const cheapest = cheapestListing(product)
  const carrying = product.listings.map(l => l.store_slug)
  const onlyInOne = carrying.length === 1
  const onlyStore = onlyInOne ? stores.find(s => s.slug === carrying[0]) : null
  const emoji = categories.find(c => c.slug === product.category)?.emoji ?? "🛒"

  const sample = product.listings[0]
  const ppuText = formatPricePerUnit(sample)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-6 py-5 border-b border-rose-mist last:border-b-0 items-center hover:bg-cream/50 transition-colors">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0" aria-hidden>{emoji}</span>
          <div>
            <Link
              href={`/produkt/${product.id}`}
              className="font-medium text-ink hover:text-rose-dusty transition-colors"
            >
              {displayName(product)}
            </Link>
            {sample?.size && (
              <div className="text-sm text-mocha">
                {formatSize(sample)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 flex gap-2 flex-wrap sm:hidden">
          {stores.map(s => (
            <MobilePriceChip
              key={s.slug}
              store={s}
              listing={product.listings.find(l => l.store_slug === s.slug)}
              isCheapest={cheapest?.store_slug === s.slug}
            />
          ))}
        </div>
        {onlyInOne && onlyStore && (
          <div className="mt-2 inline-block rounded-full px-3 py-1 text-xs italic font-serif bg-lavender-soft/40 text-ink">
            Kun hos {onlyStore.name}
          </div>
        )}
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
    </div>
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
        {isCheapest && <span className="text-rose-dusty" aria-label="Billigst">✿</span>}
        <span className="font-semibold text-ink">{formatKr(effectivePrice(listing))}</span>
      </div>
      {onCampaign && (
        <div className="text-[10px] text-mocha line-through tabular-nums mt-0.5">
          {formatKr(listing.price)}
        </div>
      )}
      {onCampaign && listing.campaign_text && (
        <div className="mt-1 text-[10px] uppercase tracking-wide text-ink bg-peach-soft/60 rounded-full px-2 py-0.5 inline-block">
          {listing.campaign_text}
        </div>
      )}
    </div>
  )
}

function MobilePriceChip({ store, listing, isCheapest }) {
  if (!listing) {
    return (
      <span className="rounded-full border border-rose-mist px-3 py-1 text-xs text-stone-300 tabular-nums">
        {store.name} —
      </span>
    )
  }
  const style = isCheapest
    ? "bg-mint-soft/40 text-ink"
    : "bg-blush-50 border border-rose-mist text-ink"
  return (
    <span className={`rounded-full px-3 py-1 text-xs tabular-nums ${style}`}>
      {isCheapest && <span className="text-rose-dusty mr-1">✿</span>}
      {store.name} {formatKr(effectivePrice(listing))}
    </span>
  )
}
