import { describe, it, expect } from 'vitest'
import { createEngine } from './recommender'
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

describe('interaction weighting (behavioral)', () => {
  // Two symmetric source→candidate pairs with equal base similarity (identical
  // vectors; all prices equal so the price feature is 0). The only thing that
  // can break the tie between candidates is the interaction weight.
  const fixture: Product[] = [
    makeProduct({ id: 'srcA', category: 'Tech', tags: ['a', 'b'], price: 50 }),
    makeProduct({ id: 'candA', category: 'Tech', tags: ['a', 'b'], price: 50 }),
    makeProduct({ id: 'srcB', category: 'Home', tags: ['c', 'd'], price: 50 }),
    makeProduct({ id: 'candB', category: 'Home', tags: ['c', 'd'], price: 50 }),
  ]
  const engine = createEngine(fixture)

  it('weights a cart signal above an equally-similar view signal', () => {
    const recs = engine.recommendForSession({
      viewedIds: ['srcA'], // → candA, weight 1
      cartIds: ['srcB'], // → candB, weight 2
      favoritedIds: [],
    })
    expect(recs[0].product.id).toBe('candB')
  })

  it('weights a favorite signal above an equally-similar cart signal', () => {
    const recs = engine.recommendForSession({
      viewedIds: [],
      cartIds: ['srcB'], // → candB, weight 2
      favoritedIds: ['srcA'], // → candA, weight 3
    })
    expect(recs[0].product.id).toBe('candA')
  })
})

describe('multi-signal weight accumulation', () => {
  // srcStrong is viewed AND favorited (1 + 3 = 4); srcWeak is favorited only (3).
  // candWeak has the higher reviewCount, so an overwrite-instead-of-add bug
  // (which would tie both sources at 3) would surface candWeak first.
  const fixture: Product[] = [
    makeProduct({
      id: 'srcStrong',
      category: 'Tech',
      tags: ['a', 'b'],
      price: 50,
    }),
    makeProduct({
      id: 'candStrong',
      category: 'Tech',
      tags: ['a', 'b'],
      price: 50,
      reviewCount: 1,
    }),
    makeProduct({
      id: 'srcWeak',
      category: 'Home',
      tags: ['c', 'd'],
      price: 50,
    }),
    makeProduct({
      id: 'candWeak',
      category: 'Home',
      tags: ['c', 'd'],
      price: 50,
      reviewCount: 999,
    }),
  ]
  const engine = createEngine(fixture)

  it('adds weights when one item carries multiple signals (view + favorite = 4)', () => {
    const recs = engine.recommendForSession({
      viewedIds: ['srcStrong'],
      cartIds: [],
      favoritedIds: ['srcStrong', 'srcWeak'],
    })
    expect(recs[0].product.id).toBe('candStrong')
  })
})

describe('source attribution', () => {
  // cand shares tags with both sources; strong is favorited (3), weak viewed (1),
  // so strong must win attribution regardless of signal order.
  const fixture: Product[] = [
    makeProduct({
      id: 'strong',
      category: 'Accessories',
      tags: ['t1', 't2'],
      price: 50,
    }),
    makeProduct({
      id: 'weak',
      category: 'Accessories',
      tags: ['t1', 't3'],
      price: 50,
    }),
    makeProduct({
      id: 'cand',
      category: 'Accessories',
      tags: ['t1', 't2', 't3'],
      price: 50,
    }),
  ]
  const engine = createEngine(fixture)

  it('attributes to the strongest weighted contributor and names it', () => {
    const recs = engine.recommendForSession({
      viewedIds: ['weak'],
      cartIds: [],
      favoritedIds: ['strong'],
    })
    expect(recs[0].product.id).toBe('cand')
    expect(recs[0].sourceId).toBe('strong')
    expect(recs[0].reason).toContain('strong')
  })
})

describe('recommendForSession — popularity fallback when nothing matches', () => {
  // 'lonely' is orthogonal to the rest (unique category + tags, equal price), so
  // interacting with it yields all-zero candidate scores → the second fallback.
  const fixture: Product[] = [
    makeProduct({
      id: 'lonely',
      category: 'Home',
      tags: ['z1', 'z2'],
      price: 50,
      reviewCount: 5,
    }),
    makeProduct({
      id: 'p1',
      category: 'Tech',
      tags: ['a', 'b'],
      price: 50,
      reviewCount: 200,
    }),
    makeProduct({
      id: 'p2',
      category: 'Bags',
      tags: ['c', 'd'],
      price: 50,
      reviewCount: 100,
    }),
  ]
  const engine = createEngine(fixture)

  it('returns popularity recs (excluding the source) when history matches nothing', () => {
    const recs = engine.recommendForSession({
      viewedIds: [],
      cartIds: [],
      favoritedIds: ['lonely'],
    })
    expect(recs.map((r) => r.product.id)).toEqual(['p1', 'p2'])
    expect(recs.every((r) => r.reason === 'Popular right now')).toBe(true)
    expect(recs.every((r) => r.sourceId === null)).toBe(true)
    expect(recs.map((r) => r.product.id)).not.toContain('lonely')
  })
})

describe('popular', () => {
  const engine = createEngine(products)

  it('ranks by review count and labels every item', () => {
    const recs = engine.popular(3)
    expect(recs.map((r) => r.product.id)).toEqual(['notebook', 'mug', 'tote'])
    expect(recs.every((r) => r.reason === 'Popular right now')).toBe(true)
    expect(recs.every((r) => r.sourceId === null)).toBe(true)
  })

  it('honors excludeIds and n', () => {
    expect(engine.popular(2)).toHaveLength(2)
    expect(engine.popular(3, ['notebook']).map((r) => r.product.id)).toEqual([
      'mug',
      'tote',
      'wallet',
    ])
  })

  it('breaks review-count ties by id ascending', () => {
    const tied = createEngine([
      makeProduct({ id: 'bbb', reviewCount: 100 }),
      makeProduct({ id: 'aaa', reviewCount: 100 }),
    ])
    expect(tied.popular().map((r) => r.product.id)).toEqual(['aaa', 'bbb'])
  })
})

describe('similarTo — zero-similarity exclusion', () => {
  const fixture: Product[] = [
    makeProduct({ id: 's', category: 'Tech', tags: ['a', 'b'], price: 50 }),
    makeProduct({
      id: 'related',
      category: 'Tech',
      tags: ['a', 'c'],
      price: 50,
    }),
    makeProduct({
      id: 'orthogonal',
      category: 'Home',
      tags: ['x', 'y'],
      price: 50,
    }),
  ]
  const engine = createEngine(fixture)

  it('never returns a zero-similarity item, even when n exceeds neighbour count', () => {
    const ids = engine.similarTo('s', 10).map((r) => r.product.id)
    expect(ids).toContain('related')
    expect(ids).not.toContain('orthogonal')
  })
})

describe('explain — fallback reason branches', () => {
  const fixture: Product[] = [
    makeProduct({
      id: 'wallet',
      category: 'Accessories',
      tags: ['leather', 'brown'],
    }),
    makeProduct({
      id: 'belt',
      category: 'Accessories',
      tags: ['canvas', 'grey'],
    }),
    makeProduct({ id: 'mug', category: 'Kitchen', tags: ['ceramic'] }),
  ]
  const engine = createEngine(fixture)

  it('names the shared category when no tags overlap', () => {
    expect(engine.explain('belt', 'wallet')).toBe('Same category: Accessories')
  })

  it('falls back to "Similar style" when nothing overlaps', () => {
    expect(engine.explain('mug', 'wallet')).toBe('Similar style')
  })
})
