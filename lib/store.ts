import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from 'zustand/middleware'
import { catalog } from '@/data/catalog'
import type { Product } from '@/lib/types'

const STORAGE_KEY = 'curio-store'
const MAX_HISTORY = 20

export interface CartLineItem {
  product: Product
  qty: number
}

interface StoreState {
  cart: Record<string, number>
  favorites: string[]
  viewed: string[]
  addToCart: (id: string, qty?: number) => void
  removeFromCart: (id: string) => void
  setQty: (id: string, qty: number) => void
  clearCart: () => void
  toggleFavorite: (id: string) => void
  recordView: (id: string) => void
}

// Used in non-browser environments (SSR, tests) so persist never touches a
// missing localStorage.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: {},
      favorites: [],
      viewed: [],
      addToCart: (id, qty = 1) =>
        set((s) => ({ cart: { ...s.cart, [id]: (s.cart[id] ?? 0) + qty } })),
      removeFromCart: (id) =>
        set((s) => {
          const cart = { ...s.cart }
          delete cart[id]
          return { cart }
        }),
      setQty: (id, qty) =>
        set((s) => {
          const cart = { ...s.cart }
          if (qty <= 0) delete cart[id]
          else cart[id] = qty
          return { cart }
        }),
      clearCart: () => set({ cart: {} }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      recordView: (id) =>
        set((s) => ({
          // Most-recent-first, de-duped, capped.
          viewed: [id, ...s.viewed.filter((v) => v !== id)].slice(
            0,
            MAX_HISTORY,
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : noopStorage,
      ),
      // Persist only data, never the action functions.
      partialize: (s) => ({
        cart: s.cart,
        favorites: s.favorites,
        viewed: s.viewed,
      }),
    },
  ),
)

const byId = new Map(catalog.map((p) => [p.id, p]))

/** Total number of items across the cart (primitive → safe as a selector). */
export function selectCartCount(s: StoreState): number {
  return Object.values(s.cart).reduce((a, b) => a + b, 0)
}

/** Join a cart record to catalog products, sorted by name (pure helper). */
export function toLineItems(cart: Record<string, number>): CartLineItem[] {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const product = byId.get(id)
      return product ? { product, qty } : null
    })
    .filter((x): x is CartLineItem => x !== null)
    .sort((a, b) => a.product.name.localeCompare(b.product.name))
}

/** Cart subtotal in dollars (primitive → safe as a selector). */
export function selectSubtotal(s: StoreState): number {
  return toLineItems(s.cart).reduce(
    (sum, li) => sum + li.product.price * li.qty,
    0,
  )
}
