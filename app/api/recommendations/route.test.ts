import { describe, it, expect } from 'vitest'
import { POST } from './route'
import type { RecommendationResponse } from '@/lib/types'
import { catalog } from '@/data/catalog'

function post(body: unknown): Request {
  return new Request('http://localhost/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function call(body: unknown): Promise<RecommendationResponse> {
  const res = await POST(post(body))
  return (await res.json()) as RecommendationResponse
}

describe('POST /api/recommendations', () => {
  it('returns a personalized, cart-excluded ranking from session signals', async () => {
    const seed = catalog[0]
    const { kind, recommendations } = await call({
      viewedIds: [seed.id],
      cartIds: [catalog[1].id],
      favoritedIds: [],
    })

    expect(kind).toBe('personalized')
    expect(recommendations.length).toBeGreaterThan(0)
    const ids = recommendations.map((r) => r.product.id)
    // Never re-recommends interacted items (the viewed seed or the cart item).
    expect(ids).not.toContain(seed.id)
    expect(ids).not.toContain(catalog[1].id)
    // Every recommendation carries a human-readable reason (R5).
    expect(recommendations.every((r) => r.reason.length > 0)).toBe(true)
    // Personalized picks attribute a source product.
    expect(recommendations.every((r) => r.sourceId !== null)).toBe(true)
  })

  it('ranks by descending score', async () => {
    const { recommendations } = await call({ viewedIds: [catalog[0].id] })
    const scores = recommendations.map((r) => r.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('falls back to popular for an empty body', async () => {
    const { kind, recommendations } = await call({})
    expect(kind).toBe('popular')
    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations.every((r) => r.sourceId === null)).toBe(true)
  })

  it('does not throw on a malformed body — non-string ids are dropped', async () => {
    const { kind, recommendations } = await call({
      viewedIds: 'not-an-array',
      cartIds: [42, true],
      favoritedIds: null,
    })
    // No valid ids survive narrowing → popularity fallback, no crash.
    expect(kind).toBe('popular')
    expect(recommendations.length).toBeGreaterThan(0)
  })
})
