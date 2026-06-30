'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False on the server and during the first client render, true thereafter.
 * Uses useSyncExternalStore so the server and client snapshots differ without a
 * setState-in-effect (and without a hydration-mismatch warning). Gate any
 * persisted-store value that affects markup (cart count, heart fill) behind
 * this — the canonical fix for Zustand `persist` hydration in Next.js.
 */
export function useHasHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
