import { describe, it, expect } from 'vitest'
import { buildVectorSpace, vectorize, PRICE_WEIGHT } from './vectorize'
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

const fixture: Product[] = [
  makeProduct({
    id: 'a',
    category: 'Bags',
    tags: ['leather', 'brown'],
    price: 100,
  }),
  makeProduct({ id: 'b', category: 'Home', tags: ['scented'], price: 20 }),
  makeProduct({
    id: 'c',
    category: 'Bags',
    tags: ['leather', 'durable'],
    price: 60,
  }),
]

describe('buildVectorSpace', () => {
  it('derives sorted, unique categories and tags', () => {
    const space = buildVectorSpace(fixture)
    expect(space.categories).toEqual(['Bags', 'Home'])
    expect(space.tags).toEqual(['brown', 'durable', 'leather', 'scented'])
  })

  it('dimension equals categories + tags + one price slot', () => {
    const space = buildVectorSpace(fixture)
    expect(space.dimension).toBe(2 + 4 + 1)
  })

  it('captures the price range', () => {
    const space = buildVectorSpace(fixture)
    expect(space.minPrice).toBe(20)
    expect(space.maxPrice).toBe(100)
  })
})

describe('vectorize', () => {
  const space = buildVectorSpace(fixture)

  it('produces a vector of length = dimension', () => {
    expect(vectorize(fixture[0], space)).toHaveLength(space.dimension)
  })

  it('one-hot encodes the category', () => {
    // categories: [Bags, Home]; product a is Bags
    expect(vectorize(fixture[0], space).slice(0, 2)).toEqual([1, 0])
  })

  it('multi-hot encodes the tags', () => {
    // tags: [brown, durable, leather, scented]; a has brown + leather
    expect(vectorize(fixture[0], space).slice(2, 6)).toEqual([1, 0, 1, 0])
  })

  it('min-price maps to 0 and max-price maps to PRICE_WEIGHT', () => {
    const min = vectorize(fixture[1], space) // price 20 = min
    const max = vectorize(fixture[0], space) // price 100 = max
    expect(min[min.length - 1]).toBe(0)
    expect(max[max.length - 1]).toBeCloseTo(PRICE_WEIGHT)
  })

  it('never divides by zero when every price is equal', () => {
    const flat = [
      makeProduct({ id: 'x', price: 50 }),
      makeProduct({ id: 'y', price: 50 }),
    ]
    const space = buildVectorSpace(flat)
    const v = vectorize(flat[0], space)
    expect(v[v.length - 1]).toBe(0)
    expect(v.every((n) => Number.isFinite(n))).toBe(true)
  })

  it('treats a non-finite price as 0 and keeps the vector finite', () => {
    const space = buildVectorSpace(fixture)
    const v = vectorize(
      makeProduct({
        id: 'weird',
        category: 'Bags',
        tags: ['leather'],
        price: NaN,
      }),
      space,
    )
    expect(v.every((n) => Number.isFinite(n))).toBe(true)
    expect(v[v.length - 1]).toBe(0)
  })
})

describe('buildVectorSpace with non-finite prices', () => {
  it('ignores non-finite prices so the space stays finite', () => {
    const space = buildVectorSpace([
      makeProduct({ id: 'a', price: 10 }),
      makeProduct({ id: 'b', price: NaN }),
      makeProduct({ id: 'c', price: 30 }),
    ])
    expect(Number.isFinite(space.minPrice)).toBe(true)
    expect(Number.isFinite(space.maxPrice)).toBe(true)
    expect(space.minPrice).toBe(10)
    expect(space.maxPrice).toBe(30)
  })
})
