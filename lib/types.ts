/**
 * Domain types — the single source of truth imported across the engine, the
 * API route, and the UI. Keep data shapes here; component-only props live with
 * their components.
 */

export type Category =
  'Accessories' | 'Bags' | 'Home' | 'Kitchen' | 'Stationery' | 'Tech'

export interface Product {
  id: string
  name: string
  price: number
  category: Category
  tags: string[]
  /** Static, display-only social proof (0–5). Not a real review system. */
  rating: number
  /** Static, display-only number of reviews. */
  reviewCount: number
  /** Path under /public; real imagery is resolved during the UI phase. */
  image: string
  blurb: string
}

/** The three signals the recommender understands, weakest to strongest. */
export type InteractionKind = 'view' | 'cart' | 'favorite'

/** A session's accumulated signals, sent from the client to the API route. */
export interface SessionSignals {
  viewedIds: string[]
  cartIds: string[]
  favoritedIds: string[]
}

export interface Recommendation {
  product: Product
  /** Aggregate similarity score that ranked this item (engine-internal scale). */
  score: number
  /**
   * Human-readable explanation, e.g.
   * "Same category · shares tags: leather, minimalist".
   */
  reason: string
  /**
   * The catalog item whose similarity contributed most to this pick, or `null`
   * for popularity-driven recommendations (no session history).
   */
  sourceId: string | null
}
