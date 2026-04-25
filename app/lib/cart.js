// Klient-side hjelpere for handlekurv lagret i localStorage.
// Kurven er en liste med { productId: number, quantity: number }.

const KEY = "cart"

export function readCart() {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(i => Number.isFinite(i?.productId) && Number.isFinite(i?.quantity) && i.quantity > 0)
      .map(i => ({ productId: i.productId, quantity: i.quantity }))
  } catch {
    return []
  }
}

function writeCart(cart) {
  window.localStorage.setItem(KEY, JSON.stringify(cart))
  window.dispatchEvent(new CustomEvent("cart-changed"))
}

export function addToCart(productId) {
  const cart = readCart()
  const existing = cart.find(i => i.productId === productId)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ productId, quantity: 1 })
  }
  writeCart(cart)
}

export function setQuantity(productId, qty) {
  const cart = readCart()
  if (qty <= 0) {
    writeCart(cart.filter(i => i.productId !== productId))
    return
  }
  const existing = cart.find(i => i.productId === productId)
  if (existing) {
    existing.quantity = qty
    writeCart(cart)
  }
}

export function removeFromCart(productId) {
  setQuantity(productId, 0)
}

export function cartItemCount(cart) {
  const list = cart ?? readCart()
  return list.reduce((sum, i) => sum + i.quantity, 0)
}
