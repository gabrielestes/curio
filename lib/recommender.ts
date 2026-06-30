import { catalog } from '../data/catalog'
import type { Product, Recommendation, SessionSignals } from './types'
import { buildVectorSpace } from './vectorize'
import { buildSimilarityMatrix, type SimilarityMatrix } from './similarity'

/**
 * Interaction weights — a favorite pulls hardest, an add-to-cart next, a
 * passive view least. These are the only knobs that tune how strongly each
 * signal steers "Recommended for you". Tunable here only.
 */
export const WEIGHTS = { view: 1, cart: 2, favorite: 3 } as const

const DEFAULT_N = 5

export interface Engine {
  /** Top-N catalog neighbours of a product, by content similarity (powers R3). */
  similarTo(productId: string, n?: number): Recommendation[]
  /** Personalized ranking from weighted session signals (powers R4 + R8). */
  recommendForSession(signals: SessionSignals, n?: number): Recommendation[]
  /** Popularity fallback used when there is no session history. */
  popular(n?: number, excludeIds?: string[]): Recommendation[]
  /** Reason string explaining why `targetId` relates to `sourceId` (powers R5). */
  explain(targetId: string, sourceId: string): string
}

interface Scored {
  product: Product
  score: number
}

/** Tags present on both products, in `target`'s order (stable for display). */
function sharedTags(target: Product, source: Product): string[] {
  const sourceTags = new Set(source.tags)
  return target.tags.filter((t) => sourceTags.has(t))
}

/**
 * Build an engine over a product set. Pure given its input — the vector space
 * and similarity matrix are computed once here, so tests can construct an
 * engine over a tiny fixture and the app builds one over the real catalog.
 */
export function createEngine(products: Product[]): Engine {
  const space = buildVectorSpace(products)
  const matrix: SimilarityMatrix = buildSimilarityMatrix(products, space)
  const byId = new Map(products.map((p) => [p.id, p]))

  function reason(target: Product, source: Product): string {
    const shared = sharedTags(target, source)
    const sameCategory = target.category === source.category
    if (sameCategory && shared.length) {
      return `Same category · shares tags: ${shared.join(', ')}`
    }
    if (shared.length) {
      return `Shares tags: ${shared.join(', ')}`
    }
    if (sameCategory) {
      return `Same category: ${target.category}`
    }
    return 'Similar style'
  }

  function explain(targetId: string, sourceId: string): string {
    const target = byId.get(targetId)
    const source = byId.get(sourceId)
    if (!target || !source) return ''
    return reason(target, source)
  }

  // Deterministic ordering: score desc, then reviewCount desc, then id asc.
  // The tie-breakers make every ranking reproducible (important for tests and
  // for a stable UI that doesn't reshuffle on identical input).
  function compare(a: Scored, b: Scored): number {
    if (b.score !== a.score) return b.score - a.score
    if (b.product.reviewCount !== a.product.reviewCount) {
      return b.product.reviewCount - a.product.reviewCount
    }
    return a.product.id.localeCompare(b.product.id)
  }

  function popular(n = DEFAULT_N, excludeIds: string[] = []): Recommendation[] {
    const exclude = new Set(excludeIds)
    return products
      .filter((p) => !exclude.has(p.id))
      .map((product) => ({ product, score: product.reviewCount }))
      .sort(compare)
      .slice(0, n)
      .map(({ product }) => ({
        product,
        score: product.reviewCount,
        reason: 'Popular right now',
        sourceId: null,
      }))
  }

  function similarTo(productId: string, n = DEFAULT_N): Recommendation[] {
    const source = byId.get(productId)
    if (!source) return []
    const row = matrix[productId] ?? {}
    return products
      .filter((p) => p.id !== productId && (row[p.id] ?? 0) > 0)
      .map((product) => ({ product, score: row[product.id] ?? 0 }))
      .sort(compare)
      .slice(0, n)
      .map(({ product, score }) => ({
        product,
        score,
        reason: reason(product, source),
        sourceId: productId,
      }))
  }

  function recommendForSession(
    signals: SessionSignals,
    n = DEFAULT_N,
  ): Recommendation[] {
    // Collapse signals into a per-product weight. An item touched in multiple
    // ways (viewed AND favorited) accumulates weight.
    const weightById = new Map<string, number>()
    const add = (ids: string[], w: number) => {
      for (const id of ids) {
        if (byId.has(id)) weightById.set(id, (weightById.get(id) ?? 0) + w)
      }
    }
    add(signals.viewedIds, WEIGHTS.view)
    add(signals.cartIds, WEIGHTS.cart)
    add(signals.favoritedIds, WEIGHTS.favorite)

    // No usable history → popularity (still excluding anything in the cart).
    if (weightById.size === 0) return popular(n, signals.cartIds)

    const interacted = new Set(weightById.keys())

    // Candidates are *fresh* items — never re-recommend something the user has
    // already viewed, carted, or favorited.
    const scored = products
      .filter((product) => !interacted.has(product.id))
      .map((product) => {
        let score = 0
        let bestSourceId: string | null = null
        let bestContribution = 0
        for (const [sourceId, weight] of weightById) {
          const contribution = weight * (matrix[sourceId]?.[product.id] ?? 0)
          score += contribution
          if (contribution > bestContribution) {
            bestContribution = contribution
            bestSourceId = sourceId
          }
        }
        return { product, score, sourceId: bestSourceId }
      })
      .filter((s) => s.score > 0)
      .sort(compare)
      .slice(0, n)

    // Interacted items shared nothing with the rest of the catalog → still show
    // a useful rail rather than an empty one.
    if (scored.length === 0) return popular(n, [...interacted])

    return scored.map(({ product, score, sourceId }) => {
      const source = sourceId ? byId.get(sourceId) : undefined
      const text = source
        ? `Based on your interest in ${source.name} · ${reason(product, source)}`
        : 'Recommended for you'
      return { product, score, reason: text, sourceId }
    })
  }

  return { similarTo, recommendForSession, popular, explain }
}

/** Singleton engine over the real catalog — built once, reused everywhere. */
export const engine = createEngine(catalog)
