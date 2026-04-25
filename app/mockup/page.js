import Link from "next/link"

export const metadata = { title: "Mockup-indeks" }

const screens = [
  {
    href: "/mockup/forside",
    emoji: "✿",
    name: "Forside",
    note: "Hero, ukens tilbud, kategori-grid, mini-om.",
    status: "ny",
  },
  {
    href: "/mockup/a",
    emoji: "🥛",
    name: "Kategori-side (Meieri)",
    note: "Tabell med filter, sortering, skjelett og tom-tilstand.",
    status: "oppdatert",
  },
  {
    href: "/mockup/tilbud",
    emoji: "✦",
    name: "Tilbud-side",
    note: "Alle kampanjer, kategori-filter, sortert etter størst rabatt.",
    status: "ny",
  },
  {
    href: "/mockup/produkt",
    emoji: "📈",
    name: "Produktdetalj",
    note: "Stort bilde, priser per butikk, prishistorikk-graf, kampanjelogg.",
    status: "ny",
  },
  {
    href: "/mockup/handleliste",
    emoji: "🛒",
    name: "Handleliste",
    note: "Kurven + totalsum per butikk + billigste-markør.",
    status: "ny",
  },
  {
    href: "/mockup/kjop",
    emoji: "✓",
    name: "Kjøpsoversikt",
    note: "Sjekk-liste når brukeren skal handle hos billigste butikk.",
    status: "ny",
  },
  {
    href: "/mockup/sok",
    emoji: "⌕",
    name: "Søkeresultat",
    note: "Globalt søk, treff-highlighting, populære søk.",
    status: "ny",
  },
  {
    href: "/mockup/handleliste-tom",
    emoji: "✿",
    name: "Tom handleliste",
    note: "Hva brukeren ser når kurven er tom.",
    status: "ny",
  },
  {
    href: "/mockup/sok-tom",
    emoji: "⌕",
    name: "Søk uten treff",
    note: "Hva brukeren ser når søket gir 0 produkter.",
    status: "ny",
  },
  {
    href: "/mockup/ikke-funnet",
    emoji: "✦",
    name: "404-side",
    note: "Vises når brukeren går til en URL som ikke finnes.",
    status: "ny",
  },
  {
    href: "/mockup/original-a",
    emoji: "📜",
    name: "Original Mockup A (sammenligning)",
    note: "Første iterasjon — uten navbar/footer, med stablede tilstander.",
    status: "arkivert",
  },
  {
    href: "/mockup/b",
    emoji: "🗃︎",
    name: "Kort-layout (arkivert)",
    note: "Gammel alternativ layout. Beholdt som referanse.",
    status: "arkivert",
  },
]

export default function MockupIndex() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3">
          Fase 2 · design-eksplorasjon
        </p>
        <h1 className="font-serif italic font-light text-5xl sm:text-6xl text-ink leading-tight">
          Mockups
        </h1>
        <div className="mt-4 h-px w-16 bg-rose-dusty" />
        <p className="mt-6 text-mocha max-w-lg">
          Klikk gjennom hver side for å evaluere designet. Alle bruker samme
          navbar, estetikk og komponent-språk. Gi tilbakemelding på det du
          ønsker endret før vi bygger Fase 7.
        </p>

        <ul className="mt-14 space-y-3">
          {screens.map(s => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex items-center gap-5 rounded-xl border border-rose-mist bg-blush-50 p-5 hover:border-rose-dusty transition-colors"
                style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
              >
                <span className="text-3xl w-12 h-12 rounded-full bg-white border border-rose-mist flex items-center justify-center flex-shrink-0" aria-hidden>
                  {s.emoji}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif italic text-xl text-ink">
                      {s.name}
                    </h2>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm text-mocha mt-1">{s.note}</p>
                </div>
                <span className="text-mocha group-hover:text-rose-dusty transition-colors">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-xs text-mocha italic font-serif text-center">
          Alle mockup-sider er midlertidige og erstattes av ekte data i Fase 7.
        </p>
      </main>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    ny: "bg-mint-soft/40 text-ink",
    oppdatert: "bg-peach-soft/40 text-ink",
    arkivert: "bg-lavender-soft/40 text-mocha",
  }
  return (
    <span
      className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${styles[status]}`}
    >
      {status}
    </span>
  )
}
