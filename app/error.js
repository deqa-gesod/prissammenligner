"use client"

import Link from "next/link"

export default function Error({ reset }) {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 text-center">
      <div className="text-6xl mb-6 text-rose-dusty" aria-hidden>✿</div>
      <h1 className="font-serif italic text-3xl text-ink mb-4">
        Noe gikk galt
      </h1>
      <p className="text-mocha text-sm max-w-md mx-auto mb-8">
        Vi får ikke kontakt med databasen akkurat nå. Prøv igjen om et øyeblikk,
        eller gå tilbake til forsiden.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="rounded-full bg-rose-dusty text-white px-6 py-3 text-sm font-medium hover:bg-rose-dusty/90 transition-colors"
        >
          Prøv på nytt
        </button>
        <Link
          href="/"
          className="rounded-full border border-rose-mist bg-white text-ink px-6 py-3 text-sm hover:border-rose-dusty transition-colors"
        >
          Til forsiden
        </Link>
      </div>
    </div>
  )
}
