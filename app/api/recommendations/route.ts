import { NextResponse } from 'next/server'
import { engine } from '@/lib/recommender'
import type { RecommendationResponse, SessionSignals } from '@/lib/types'

/** How many recommendations the personalized rail requests. */
const DEFAULT_N = 4

/** Narrow an unknown array field to a string[] at the trust boundary. */
function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : []
}

/**
 * Coerce an arbitrary request body into safe session signals. A missing,
 * empty, or malformed body yields all-empty arrays, which the engine turns
 * into a popularity fallback — so the route never throws on bad input.
 */
function toSignals(body: unknown): SessionSignals {
  const b = (body ?? {}) as Record<string, unknown>
  return {
    viewedIds: toStringArray(b.viewedIds),
    cartIds: toStringArray(b.cartIds),
    favoritedIds: toStringArray(b.favoritedIds),
  }
}

/**
 * POST /api/recommendations
 * Body: SessionSignals. Returns a ranked, cart-excluded list. `kind` reports
 * whether the ranking was personalized or fell back to popularity, so the
 * client can label the rail without inspecting engine-internal scores.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<RecommendationResponse>> {
  const body = await request.json().catch(() => null)
  const signals = toSignals(body)

  const recommendations = engine.recommendForSession(signals, DEFAULT_N)
  const kind = recommendations.some((r) => r.sourceId !== null)
    ? 'personalized'
    : 'popular'

  return NextResponse.json({ kind, recommendations })
}
