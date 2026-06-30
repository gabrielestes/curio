'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

/**
 * Records a `view` interaction when a product page mounts. Rendered (returning
 * nothing) by the server detail page so the view feeds the session recommender.
 */
export function ViewTracker({ productId }: { productId: string }) {
  const recordView = useStore((s) => s.recordView)
  useEffect(() => {
    recordView(productId)
  }, [productId, recordView])
  return null
}
