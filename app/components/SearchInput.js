// Søkefelt i toppbaren. Pill-shape, rose-mist border, cream-tint bakgrunn.
// Implementeres i Fase 7.
function SearchInput({ value, onChange }) {
  return (
    <div className="relative flex-1 max-w-md">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mocha text-sm">⌕</span>
      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        placeholder="Søk…"
        className="w-full rounded-full border border-rose-mist bg-blush-50 pl-10 pr-4 py-3 text-sm placeholder:text-mocha focus:outline-none focus:border-rose-dusty"
      />
    </div>
  )
}

export default SearchInput
