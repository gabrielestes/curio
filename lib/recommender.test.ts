import { describe, it, expect } from 'vitest'
import { createEngine, WEIGHTS } from './recommender'
import type { Product, SessionSignals } from './types'

function makeProduct(over: Partial<Product> & Pick<Product, 'id'>): Product {
  return {
    name: over.id,
    price: 50,
    category: 'Home',
    tags: [],
    rating: 4.5,
    reviewCount: 100,
    image: '',
    blurb: '',
    ...over,
  }
}

// A fixture with a clear "leather" cluster (wallet/tote/watch/backpack) and
// unrelated items, so semantic assertions are easy to reason about.
const products: Product[] = [
  makeProduct({
    id: 'wallet',
    category: 'Accessories',
    tags: ['leather', 'minimalist', 'brown'],
    price: 39,
    reviewCount: 120,
  }),
  makeProduct({
    id: 'tote',
    category: 'Bags',
    tags: ['leather', 'durable', 'brown'],
    price: 129,
    reviewCount: 128,
  }),
  makeProduct({
    id: 'watch',
    category: 'Accessories',
    tags: ['leather', 'classic', 'durable'],
    price: 99,
    reviewCount: 116,
  }),
  makeProduct({
    id: 'headphones',
    category: 'Tech',
    tags: ['tech', 'premium', 'black'],
    price: 149,
    reviewCount: 96,
  }),
  makeProduct({
    id: 'mug',
    category: 'Kitchen',
    tags: ['cozy', 'ceramic', 'neutral'],
    price: 18,
    reviewCount: 245,
  }),
  makeProduct({
    id: 'notebook',
    category: 'Stationery',
    tags: ['minimalist', 'neutral', 'paper'],
    price: 16,
    reviewCount: 312,
  }),
]

const empty: SessionSignals = { viewedIds: [], cartIds: [], favoritedIds: [] }

describe('similarTo', () => {
  const engine = createEngine(products)

  it('never recommends the product itself', () => {
    const ids = engine.similarTo('wallet').map((r) => r.product.id)
    expect(ids).not.toContain('wallet')
  })

  it('surfaces the leather neighbours for a leather product', () => {
    const top = engine.similarTo('wallet', 2).map((r) => r.product.id)
    expect(top).toContain('tote')
    expect(top).toContain('watch')
    expect(top).not.toContain('mug')
  })

  it('orders results by descending score', () => {
    const scores = engine.similarTo('wallet').map((r) => r.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('respects the requested count', () => {
    expect(engine.similarTo('wallet', 1)).toHaveLength(1)
  })

  it('explains a recommendation via shared tags', () => {
    expect(engine.similarTo('wallet', 1)[0].reason).toMatch(/shares tags:/)
  })

  it('returns nothing for an unknown product', () => {
    expect(engine.similarTo('does-not-exist')).toEqual([])
  })
})

describe('recommendForSession', () => {
  const engine = createEngine(products)

  it('falls back to popularity (by review count) with no history', () => {
    const recs = engine.recommendForSession(empty, 3)
    expect(recs.map((r) => r.product.id)).toEqual(['notebook', 'mug', 'tote'])
    expect(recs.every((r) => r.reason === 'Popular right now')).toBe(true)
    expect(recs.every((r) => r.sourceId === null)).toBe(true)
  })

  it('recommends items similar to a viewed product, excluding the source', () => {
    const recs = engine.recommendForSession({ ...empty, viewedIds: ['wallet'] })
    const ids = recs.map((r) => r.product.id)
    expect(ids).not.toContain('wallet')
    expect(ids[0]).toMatch(/tote|watch/)
  })

  it('excludes items already in the cart', () => {
    const recs = engine.recommendForSession({
      ...empty,
      viewedIds: ['wallet'],
      cartIds: ['tote'],
    })
    expect(recs.map((r) => r.product.id)).not.toContain('tote')
  })

  it('weights a favorite above a view when they pull in different directions', () => {
    // View a tech item, favorite a leather item → leather neighbour wins.
    const recs = engine.recommendForSession({
      viewedIds: ['headphones'],
      cartIds: [],
      favoritedIds: ['watch'],
    })
    expect(recs[0].product.id).toBe('tote')
  })

  it('attributes a session recommendation to a source product', () => {
    const recs = engine.recommendForSession({
      ...empty,
      favoritedIds: ['wallet'],
    })
    expect(recs[0].sourceId).not.toBeNull()
    expect(recs[0].reason).toMatch(/^Based on your interest in/)
  })

  it('ignores unknown ids in the signals', () => {
    const recs = engine.recommendForSession({ ...empty, viewedIds: ['ghost'] })
    // Unknown id contributes nothing → behaves like no history → popularity.
    expect(recs.every((r) => r.reason === 'Popular right now')).toBe(true)
  })

  it('is deterministic across identical calls', () => {
    const a = engine.recommendForSession({ ...empty, viewedIds: ['wallet'] })
    const b = engine.recommendForSession({ ...empty, viewedIds: ['wallet'] })
    expect(a.map((r) => r.product.id)).toEqual(b.map((r) => r.product.id))
  })
})

describe('explain', () => {
  const engine = createEngine(products)

  it('names same category and shared tags', () => {
    // wallet & watch are both Accessories and share "leather".
    expect(engine.explain('wallet', 'watch')).toBe(
      'Same category · shares tags: leather',
    )
  })

  it('falls back to shared tags across different categories', () => {
    // wallet (Accessories) & tote (Bags) share leather + brown.
    expect(engine.explain('wallet', 'tote')).toMatch(/^Shares tags: /)
  })

  it('returns an empty string for unknown ids', () => {
    expect(engine.explain('wallet', 'ghost')).toBe('')
  })
})

describe('WEIGHTS', () => {
  it('orders favorite > cart > view', () => {
    expect(WEIGHTS.favorite).toBeGreaterThan(WEIGHTS.cart)
    expect(WEIGHTS.cart).toBeGreaterThan(WEIGHTS.view)
  })
})
