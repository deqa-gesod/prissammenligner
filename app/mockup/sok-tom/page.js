import Link from "next/link"
import { categories } from "../mock-data"
import NavBar from "../NavBar"
import Footer from "../Footer"

export const metadata = { title: "Mockup · Søk (uten treff)" }

export default function MockupSokTom() {
  const query = "akevitt"

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <SearchHeader query={query} />
          <EmptyResult query={query} />
          <Suggestions />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SearchHeader({ query }) {
  return (
    <header className="mb-8">
      <div className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-mocha text-lg">⌕</span>
        <input
          type="text"
          defaultValue={query}
          className="w-full rounded-full border-2 border-rose-dusty bg-blush-50 pl-12 pr-5 py-4 text-base text-ink focus:outline-none"
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha hover:text-ink w-8 h-8 rounded-full flex items-center justify-center"
          aria-label="Fjern søk"
        >
          ✕
        </button>
      </div>

      <p className="mt-5 text-sm text-mocha">
        0 treff for{" "}
        <span className="italic font-serif text-ink">"{query}"</span>
      </p>
    </header>
  )
}

function EmptyResult({ query }) {
  return (
    <section
      className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center"
      style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
    >
      <div className="text-6xl mb-6 text-rose-dusty" aria-hidden>✿</div>
      <h2 className="font-serif italic text-3xl text-ink mb-4">
        Ingen treff
      </h2>
      <p className="text-mocha text-sm max-w-md mx-auto mb-2">
        Vi fant ingen produkter som matcher{" "}
        <span className="italic font-serif text-ink">"{query}"</span>.
      </p>
      <p className="text-mocha text-sm max-w-md mx-auto mb-8">
        Det kan være at varen ikke føres hos Oda, Meny eller Spar — eller
        at den heter noe annet i butikken. Prøv et annet søkeord, eller
        bla i kategoriene.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/mockup/forside"
          className="inline-block rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
        >
          Til forsiden
        </Link>
        <button className="inline-block rounded-full border border-rose-mist bg-white text-ink px-6 py-3 text-sm hover:border-rose-dusty transition-colors">
          Tøm søkefeltet
        </button>
      </div>
    </section>
  )
}

function Suggestions() {
  return (
    <section className="mt-12">
      <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3 text-center">
        Eller bla gjennom
      </p>
      <h2 className="font-serif italic text-xl text-ink mb-6 text-center">
        Kategoriene
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map(c => (
          <Link
            key={c.slug}
            href="/mockup/a"
            className="rounded-xl border border-rose-mist bg-blush-50 p-4 flex items-center gap-3 hover:border-rose-dusty transition-colors"
          >
            <span className="text-2xl" aria-hidden>{c.emoji}</span>
            <div>
              <div className="font-medium text-ink text-sm">{c.name}</div>
              <div className="text-xs text-mocha tabular-nums">{c.count}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
