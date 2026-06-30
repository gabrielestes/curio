import { describe, it, expect } from 'vitest'
import { cosineSimilarity, buildSimilarityMatrix } from './similarity'
import type { Product } from './types'

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

describe('cosineSimilarity', () => {
  it('is 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1)
  })

  it('is 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
  })

  it('is symmetric', () => {
    const a = [0.2, 0.9, 0.1]
    const b = [0.5, 0.3, 0.8]
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a))
  })

  it('returns 0 when either vector is all zeros (no divide-by-zero)', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0)
    expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0)
  })

  it('stays within [0, 1] for non-negative vectors', () => {
    const s = cosineSimilarity([1, 2, 0], [0, 2, 3])
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThanOrEqual(1)
  })

  it('matches a hand-computed example: [1,1,0]·[1,0,0] = 1/√2', () => {
    expect(cosineSimilarity([1, 1, 0], [1, 0, 0])).toBeCloseTo(1 / Math.SQRT2)
  })
})

describe('buildSimilarityMatrix', () => {
  const products: Product[] = [
    makeProduct({ id: 'a', category: 'Bags', tags: ['leather', 'brown'] }),
    makeProduct({ id: 'b', category: 'Home', tags: ['scented'] }),
    makeProduct({ id: 'c', category: 'Bags', tags: ['leather', 'durable'] }),
  ]
  const matrix = buildSimilarityMatrix(products)

  it('gives self-similarity of 1', () => {
    expect(matrix['a']['a']).toBeCloseTo(1)
  })

  it('is symmetric', () => {
    expect(matrix['a']['c']).toBeCloseTo(matrix['c']['a'])
  })

  it('ranks a same-category, shared-tag pair above an unrelated pair', () => {
    // a & c share category Bags + tag leather; b is unrelated.
    expect(matrix['a']['c']).toBeGreaterThan(matrix['a']['b'])
  })
})
