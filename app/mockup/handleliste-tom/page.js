import Link from "next/link"
import NavBar from "../NavBar"
import Footer from "../Footer"

export const metadata = { title: "Mockup · Handleliste (tom)" }

export default function MockupHandlelisteTom() {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <NavBar cartCount={0} />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <header className="mb-10">
            <p className="text-xs uppercase tracking-wider text-rose-dusty mb-2">
              ✿ Samlet sammenligning
            </p>
            <h1 className="font-serif italic font-light text-4xl sm:text-5xl text-ink">
              Min handleliste
            </h1>
            <div className="mt-3 h-px w-16 bg-rose-dusty" />
            <p className="mt-4 text-mocha text-sm">
              Du har ingen produkter i lista ennå.
            </p>
          </header>

          <section
            className="rounded-xl border border-rose-mist bg-blush-50 py-20 px-6 text-center"
            style={{ boxShadow: "0 1px 3px rgba(217,165,165,0.12)" }}
          >
            <div className="text-6xl mb-6 text-rose-dusty" aria-hidden>✿</div>
            <h2 className="font-serif italic text-3xl text-ink mb-4">
              Handlelista er tom
            </h2>
            <p className="text-mocha text-sm max-w-md mx-auto mb-8">
              Legg til produkter fra kategoriene for å se totalsum per
              butikk og finne ut hvor det er billigst å handle akkurat din kurv.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/mockup/forside"
                className="inline-block rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
              >
                Utforsk produkter
              </Link>
              <Link
                href="/mockup/tilbud"
                className="inline-block rounded-full border border-rose-mist bg-white text-ink px-6 py-3 text-sm hover:border-rose-dusty transition-colors"
              >
                Se ukens tilbud ✦
              </Link>
            </div>
          </section>

          <section className="mt-12">
            <p className="text-xs uppercase tracking-wider text-rose-dusty mb-3 text-center">
              Tips
            </p>
            <p className="text-center text-mocha text-sm italic font-serif max-w-md mx-auto">
              Bla i en kategori, klikk på et produkt og bruk{" "}
              <span className="not-italic font-sans text-ink">
                "Legg i handleliste"
              </span>{" "}
              for å begynne.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
