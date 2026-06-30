'use client'

import { selectCartCount, useStore } from '@/lib/store'
import { useHasHydrated } from '@/lib/useHasHydrated'

/** Small count bubble for the cart nav links. Hidden until hydrated + non-zero. */
export function CartBadge() {
  const hydrated = useHasHydrated()
  const count = useStore(selectCartCount)
  if (!hydrated || count === 0) return null

  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground tabular-nums">
      {count}
    </span>
  )
}
