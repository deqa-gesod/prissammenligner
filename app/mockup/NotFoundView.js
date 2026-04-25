import Link from "next/link"

// Delt 404-visning. Brukes b\u00e5de av /mockup/ikke-funnet (mockup) og av app/not-found.js (ekte 404).
function NotFoundView() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-lg">
        <div className="inline-block text-rose-dusty text-2xl mb-6 tracking-[0.5em]">
          ✿ ✿ ✿
        </div>
        <p className="font-serif italic text-mocha text-sm uppercase tracking-wider mb-3">
          Feil 404
        </p>
        <h1 className="font-serif italic font-light text-5xl sm:text-6xl text-ink leading-tight mb-4">
          Siden finnes ikke
        </h1>
        <div className="mt-2 mb-6 inline-block h-px w-16 bg-rose-dusty" />
        <p className="text-mocha mb-10 max-w-sm mx-auto">
          Lenken er kanskje skrevet feil, eller siden har blitt fjernet.
          Vi tar deg gjerne tilbake til noe nyttig.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
          >
            Til forsiden
          </Link>
          <Link
            href="/mockup/tilbud"
            className="inline-block rounded-full border border-rose-mist bg-blush-50 text-ink px-6 py-3 text-sm hover:border-rose-dusty transition-colors"
          >
            Se ukens tilbud ✦
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFoundView
