import { describe, it, expect } from 'vitest'
import { catalog } from './catalog'
import { buildVectorSpace } from '../lib/vectorize'
import { engine } from '../lib/recommender'

describe('catalog', () => {
  it('contains exactly 12 products', () => {
    expect(catalog).toHaveLength(12)
  })

  it('has unique product ids', () => {
    expect(new Set(catalog.map((p) => p.id)).size).toBe(catalog.length)
  })

  it('exposes a non-trivial tag vocabulary for meaningful similarity', () => {
    const { tags } = buildVectorSpace(catalog)
    expect(tags.length).toBeGreaterThanOrEqual(12)
  })

  it('gives every product at least two tags so neighbours can overlap', () => {
    expect(catalog.every((p) => p.tags.length >= 2)).toBe(true)
  })

  it('has valid ratings and positive review counts', () => {
    expect(catalog.every((p) => p.rating >= 0 && p.rating <= 5)).toBe(true)
    expect(
      catalog.every(
        (p) => Number.isInteger(p.reviewCount) && p.reviewCount > 0,
      ),
    ).toBe(true)
  })
})

describe('catalog clustering (real engine)', () => {
  it('surfaces other leather goods as neighbours of the leather wallet', () => {
    const ids = engine.similarTo('leather-wallet', 4).map((r) => r.product.id)
    const leatherGoods = ['leather-tote', 'field-watch', 'leather-backpack']
    expect(leatherGoods.some((id) => ids.includes(id))).toBe(true)
  })

  it('gives every product at least one neighbour with positive similarity', () => {
    for (const product of catalog) {
      expect(
        engine.similarTo(product.id, catalog.length).length,
      ).toBeGreaterThan(0)
    }
  })
})
