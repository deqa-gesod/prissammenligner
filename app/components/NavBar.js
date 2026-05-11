"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { categories } from "../lib/categories"
import { cartItemCount } from "../lib/cart"

function NavBar({ active }) {
  const [open, setOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const update = () => setCartCount(cartItemCount())
    update()
    window.addEventListener("cart-changed", update)
    window.addEventListener("storage", update)
    return () => {
      window.removeEventListener("cart-changed", update)
      window.removeEventListener("storage", update)
    }
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-rose-mist">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-5 sm:py-6 flex items-center gap-6">
          <Link
            href="/"
            className="font-serif italic text-2xl sm:text-3xl text-ink whitespace-nowrap"
            onClick={() => setOpen(false)}
          >
            Prissammenligner
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-base">
            {categories.map(c => (
              <NavLink
                key={c.slug}
                href={`/kategori/${c.slug}`}
                active={active === c.slug}
              >
                {c.name}
              </NavLink>
            ))}
            <NavLink href="/tilbud" active={active === "tilbud"} accent>
              ✦ Tilbud
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/sok"
              className="hidden sm:flex items-center gap-2 rounded-full border border-sky-soft bg-sky-soft/20 px-5 py-2.5 text-base text-mocha hover:border-rose-dusty transition-colors min-w-[220px]"
            >
              <span className="text-sky-soft text-lg">⌕</span>
              <span>Søk alle butikker…</span>
            </Link>

            <Link
              href="/sok"
              className="sm:hidden rounded-full border border-sky-soft bg-sky-soft/20 w-12 h-12 flex items-center justify-center hover:border-rose-dusty transition-colors text-sky-soft text-xl"
              aria-label="Søk"
            >
              ⌕
            </Link>

            <Link
              href="/handleliste"
              className="relative rounded-full border border-sky-soft bg-sky-soft/20 w-12 h-12 flex items-center justify-center hover:border-rose-dusty transition-colors"
              aria-label={cartCount > 0 ? `Handleliste, ${cartCount} produkter` : "Handleliste"}
            >
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-dusty text-white text-xs font-medium flex items-center justify-center tabular-nums"
                  aria-hidden
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(o => !o)}
              className="lg:hidden rounded-full border border-sky-soft bg-sky-soft/20 w-12 h-12 flex items-center justify-center hover:border-rose-dusty transition-colors text-sky-soft text-xl"
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
                href={`/kategori/${c.slug}`}
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
              href="/tilbud"
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
  const base = "relative px-4 py-2 rounded-full whitespace-nowrap transition-colors"
  const state = active
    ? "text-ink"
    : accent
      ? "text-ink hover:text-rose-dusty"
      : "text-mocha hover:text-ink"
  return (
    <Link href={href} className={`${base} ${state}`}>
      {children}
      {active && (
        <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-rose-dusty" />
      )}
    </Link>
  )
}

export default NavBar
