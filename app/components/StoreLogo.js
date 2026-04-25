// Oda/Meny/Spar-merke. Foreløpig bare tekst — bytt til SVG-logoer senere.
// Implementeres i Fase 7.
function StoreLogo({ store_slug, size }) {
  const names = { oda: "Oda", meny: "Meny", spar: "Spar" }
  return (
    <span className="text-mocha text-xs uppercase tracking-wider">
      TODO: {names[store_slug] || store_slug}
    </span>
  )
}

export default StoreLogo
