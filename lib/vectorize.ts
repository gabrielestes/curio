import type { Product } from './types'

/**
 * Weight applied to the single normalized-price feature so price stays a
 * *secondary* signal next to the many category/tag dimensions. Without this,
 * two unrelated items at the same price could look similar. Tunable here only.
 */
export const PRICE_WEIGHT = 0.5

export interface VectorSpace {
  /** Sorted, unique category labels — fixes the one-hot layout. */
  categories: string[]
  /** Sorted, unique tag labels — fixes the multi-hot layout. */
  tags: string[]
  minPrice: number
  maxPrice: number
  /** categories.length + tags.length + 1 (price). */
  dimension: number
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort()
}

/**
 * Derive the feature space (vocabulary + price range) from the catalog. The
 * vocabulary is data-driven, so adding a product with a new tag automatically
 * grows every vector consistently.
 */
export function buildVectorSpace(products: Product[]): VectorSpace {
  const categories = uniqueSorted(products.map((p) => p.category))
  const tags = uniqueSorted(products.flatMap((p) => p.tags))
  // Ignore non-finite prices so one bad value can't make the whole space NaN.
  const prices = products.map((p) => p.price).filter((n) => Number.isFinite(n))
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  return {
    categories,
    tags,
    minPrice,
    maxPrice,
    dimension: categories.length + tags.length + 1,
  }
}

/** Min–max normalize price into [0, 1]; collapses to 0 when all prices match. */
function normalizePrice(price: number, space: VectorSpace): number {
  // A NaN/Infinity price would poison every cosine score it touches.
  if (!Number.isFinite(price)) return 0
  const span = space.maxPrice - space.minPrice
  if (span === 0) return 0
  const clamped = Math.min(Math.max(price, space.minPrice), space.maxPrice)
  return (clamped - space.minPrice) / span
}

/**
 * Encode a product as `[category one-hot | tags multi-hot | weighted price]`.
 * All features are non-negative, which keeps cosine similarity within [0, 1].
 */
export function vectorize(product: Product, space: VectorSpace): number[] {
  const categoryPart = space.categories.map((c) =>
    c === product.category ? 1 : 0,
  )
  const tagSet = new Set(product.tags)
  const tagPart = space.tags.map((t) => (tagSet.has(t) ? 1 : 0))
  const pricePart = normalizePrice(product.price, space) * PRICE_WEIGHT
  return [...categoryPart, ...tagPart, pricePart]
}
