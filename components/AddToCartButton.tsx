'use client'

import { useStore } from '@/lib/store'

export function AddToCartButton({
  productId,
  className = '',
}: {
  productId: string
  className?: string
}) {
  const addToCart = useStore((s) => s.addToCart)

  return (
    <button
      type="button"
      onClick={() => addToCart(productId)}
      className={`rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      Add to cart
    </button>
  )
}
