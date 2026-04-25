"use client"

import Link from "next/link"
import { useState } from "react"
import { categories } from "./mock-data"

// Topbar — brukes i alle mockup-sider.
// - Logo til venstre (lenker til mockup-indeks)
// - Kategori-lenker (lg+, ellers i hamburger-meny)
// - Tilbud-lenke
// - Søk-chip (sm+)
// - Handleliste-ikon med antall-badge
// - Hamburger-meny som åpner drawer (lg-)
function NavBar({ active, cartCount = 3 }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-rose-mist">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center gap-6">
          <Link
            href="/mockup"
            className="font-serif italic text-xl text-ink whitespace-nowrap"
            onClick={() => setOpen(false)}
          >
            Prissammenligner
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-sm">
            {categories.map(c => (
              <NavLink key={c.slug} href="/mockup/a" active={active === c.slug}>
                {c.name}
              </NavLink>
            ))}
            <NavLink href="/mockup/tilbud" active={active === "tilbud"} accent>
              ✦ Tilbud
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/mockup/sok"
              className="hidden sm:flex items-center gap-2 rounded-full border border-sky-soft bg-sky-soft/20 px-4 py-2 text-sm text-mocha hover:border-rose-dusty transition-colors min-w-[180px]"
            >
              <span className="text-sky-soft text-base">⌕</span>
              <span>Søk alle butikker…</span>
            </Link>

            <Link
              href="/mockup/sok"
              className="sm:hidden rounded-full border border-sky-soft bg-sky-soft/20 w-10 h-10 flex items-center justify-center hover:border-rose-dusty transition-colors text-sky-soft text-lg"
              aria-label="Søk"
            >
              ⌕
            </Link>

            <Link
              href="/mockup/handleliste"
              className="relative rounded-full border border-sky-soft bg-sky-soft/20 w-10 h-10 flex items-center justify-center hover:border-rose-dusty transition-colors"
              aria-label="Handleliste"
            >
              <span className="text-base">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-dusty text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(o => !o)}
              className="lg:hidden rounded-full border border-sky-soft bg-sky-soft/20 w-10 h-10 flex items-center justify-center hover:border-rose-dusty transition-colors text-sky-soft text-lg"
              aria-label={open ? "Lukk meny" : "Åpne meny"}
              aria-expanded={open}
            >
              {open ? "✕" : "≡"}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-rose-mist bg-cream px-6 sm:px-10 py-4 space-y-1">
            {categories.map(c => (
              <Link
                key={c.slug}
                href="/mockup/a"
                onClick={() => setOpen(false)}
                className={`block py-2 px-3 rounded-full text-sm transition-colors ${
                  active === c.slug
                    ? "bg-rose-mist text-ink"
                    : "text-mocha hover:bg-blush-50"
                }`}
              >
                <span className="mr-2">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
            <Link
              href="/mockup/tilbud"
              onClick={() => setOpen(false)}
              className={`block py-2 px-3 rounded-full text-sm transition-colors ${
                active === "tilbud"
                  ? "bg-peach-soft/40 text-ink"
                  : "text-ink hover:bg-blush-50"
              }`}
            >
              ✦ Tilbud
            </Link>
          </div>
        )}
      </nav>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-ink/20"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  )
}

function NavLink({ href, active, accent, children }) {
  const base = "relative px-3 py-2 rounded-full whitespace-nowrap transition-colors"
  const state = active
    ? "text-ink"
    : accent
      ? "text-ink hover:text-rose-dusty"
      : "text-mocha hover:text-ink"
  return (
    <Link href={href} className={`${base} ${state}`}>
      {children}
      {active && (
        <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-rose-dusty" />
      )}
    </Link>
  )
}

export default NavBar
