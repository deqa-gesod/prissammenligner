// Vises når filter/søk gir null treff.
// Implementeres i Fase 7.
function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-rose-mist bg-blush-50 py-16 px-6 text-center">
      <div className="text-5xl mb-4" aria-hidden>✿</div>
      <h2 className="font-serif italic text-2xl text-ink mb-2">Ingen treff</h2>
      <p className="text-mocha text-sm">
        TODO: {message || "Ingen produkter matcher filteret"}
      </p>
    </div>
  )
}

export default EmptyState
