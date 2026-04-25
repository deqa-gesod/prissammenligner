"use client"

import { useEffect, useState } from "react"
import { addToCart } from "../lib/cart"

// Knapp på produktdetalj-siden. Skriver til localStorage og viser
// kort bekreftelses-toast nederst på skjermen.
function AddToCartButton({ productId, productName }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!shown) return
    const t = setTimeout(() => setShown(false), 2500)
    return () => clearTimeout(t)
  }, [shown])

  function handleClick() {
    addToCart(productId)
    setShown(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="mt-6 rounded-full bg-rose-dusty text-white px-6 py-3 font-medium hover:bg-rose-dusty/90 transition-colors"
      >
        Legg i handleliste
      </button>

      <div
        className={`fixed left-1/2 bottom-8 -translate-x-1/2 z-40 transition-all duration-300 ${
          shown
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-live="polite"
        role="status"
      >
        <div
          className="flex items-center gap-3 rounded-full bg-cream border-2 border-mint-soft px-5 py-3 max-w-md"
          style={{ boxShadow: "0 4px 16px rgba(217,165,165,0.18)" }}
        >
          <span className="w-7 h-7 rounded-full bg-mint-soft flex items-center justify-center text-ink text-sm">
            ✓
          </span>
          <span className="text-sm text-ink">
            <span className="italic font-serif">{productName}</span> lagt til
          </span>
          <span className="text-rose-dusty">✿</span>
        </div>
      </div>
    </>
  )
}

export default AddToCartButton
