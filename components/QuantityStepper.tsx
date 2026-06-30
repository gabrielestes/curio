'use client'

import { useStore } from '@/lib/store'

export function QuantityStepper({
  productId,
  qty,
}: {
  productId: string
  qty: number
}) {
  const setQty = useStore((s) => s.setQty)

  return (
    <div className="inline-flex items-center rounded-full ring-1 ring-border">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setQty(productId, qty - 1)}
        className="grid h-8 w-8 place-items-center rounded-full text-foreground/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        −
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setQty(productId, qty + 1)}
        className="grid h-8 w-8 place-items-center rounded-full text-foreground/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        +
      </button>
    </div>
  )
}
