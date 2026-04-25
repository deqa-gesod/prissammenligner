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
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 flex items-center gap-6">
          <Link
            href="/"
            className="font-serif italic text-xl text-ink whitespace-nowrap"
            onClick={() => setOpen(false)}
          >
            Prissammenligner
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-sm">
            {categories.map(c => (
              <CategoryLink
                key={c.slug}
                category={c}
                active={active === c.slug}
              />
            ))}
            <NavLink href="/tilbud" active={active === "tilbud"} accent>
              ✦ Tilbud
            </NavLink>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/sok"
              className="hidden sm:flex items-center gap-2 rounded-full border border-sky-soft bg-sky-soft/20 px-4 py-2 text-sm text-mocha hover:border-rose-dusty transition-colors min-w-[180px]"
            >
              <span className="text-sky-soft text-base">⌕</span>
              <span>Søk alle butikker…</span>
            </Link>

            <Link
              href="/sok"
              className="sm:hidden rounded-full border border-sky-soft bg-sky-soft/20 w-10 h-10 flex items-center justify-center hover:border-rose-dusty transition-colors text-sky-soft text-lg"
              aria-label="Søk"
            >
              ⌕
            </Link>

            <Link
              href="/handleliste"
              className="relative rounded-full border border-sky-soft bg-sky-soft/20 w-10 h-10 flex items-center justify-center hover:border-rose-dusty transition-colors"
              aria-label={cartCount > 0 ? `Handleliste, ${cartCount} produkter` : "Handleliste"}
            >
              <span className="text-base">🛒</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-dusty text-white text-[11px] font-medium flex items-center justify-center tabular-nums"
                  aria-hidden
                >
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
            {categories.map(c =>
              c.enabled ? (
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
              ) : (
                <span
                  key={c.slug}
                  title="Kommer snart"
                  className="block py-2 px-3 rounded-full text-sm text-mocha/40 cursor-not-allowed"
                >
                  <span className="mr-2">{c.emoji}</span>
                  {c.name}
                  <span className="ml-2 text-xs italic font-serif">snart</span>
                </span>
              )
            )}
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

function CategoryLink({ category, active }) {
  if (!category.enabled) {
    return (
      <span
        title="Kommer snart"
        className="px-3 py-2 rounded-full whitespace-nowrap text-mocha/40 cursor-not-allowed"
      >
        {category.name}
      </span>
    )
  }
  return (
    <NavLink href={`/kategori/${category.slug}`} active={active}>
      {category.name}
    </NavLink>
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
