'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { useHasHydrated } from '@/lib/useHasHydrated'
import type { Recommendation, RecommendationResponse } from '@/lib/types'
import { RecommendationRail } from './RecommendationRail'

/**
 * The personalized "Recommended for you" rail on the home page. Reads the
 * session's signals from the persisted store, asks the API to rank the catalog
 * against them, and renders the result with a reason on every item.
 *
 * With no history it renders nothing — the "Bestselling" section below is the
 * intentional fallback, so the personalized rail only appears once the shopper
 * has actually interacted (the payoff moment).
 */
export function RecommendedForYou() {
  const hydrated = useHasHydrated()
  const viewed = useStore((s) => s.viewed)
  const cart = useStore((s) => s.cart)
  const favorites = useStore((s) => s.favorites)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  const cartIds = Object.keys(cart)
  const hasHistory =
    viewed.length > 0 || cartIds.length > 0 || favorites.length > 0

  // Signals are primitives joined into stable strings so the effect only re-runs
  // when the actual ids change, not on every store reference change.
  const viewedKey = viewed.join(',')
  const cartKey = cartIds.join(',')
  const favoritesKey = favorites.join(',')

  useEffect(() => {
    // No signals → nothing to fetch; the component renders null below and the
    // Bestselling section stands in as the fallback.
    if (!hydrated || !hasHistory) return
    let active = true
    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viewedIds: viewedKey ? viewedKey.split(',') : [],
        cartIds: cartKey ? cartKey.split(',') : [],
        favoritedIds: favoritesKey ? favoritesKey.split(',') : [],
      }),
    })
      .then((res) => res.json() as Promise<RecommendationResponse>)
      .then((data) => {
        if (active) setRecommendations(data.recommendations)
      })
      .catch(() => {
        // A failed fetch simply leaves the rail empty; Bestselling still shows.
        if (active) setRecommendations([])
      })
    // Ignore a stale response if signals change before this one resolves.
    return () => {
      active = false
    }
  }, [hydrated, hasHistory, viewedKey, cartKey, favoritesKey])

  if (!hydrated || !hasHistory) return null

  return (
    <RecommendationRail
      title="Recommended for you"
      recommendations={recommendations}
    />
  )
}
