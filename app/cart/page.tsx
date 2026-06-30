'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { toLineItems, useStore } from '@/lib/store'
import { useHasHydrated } from '@/lib/useHasHydrated'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/ProductImage'
import { QuantityStepper } from '@/components/QuantityStepper'

function EmptyCart() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-2xl text-foreground">
        Your cart is empty
      </h1>
      <p className="mt-2 text-muted">
        Find something you&rsquo;ll love over in the shop.
      </p>
      <Link
        href="/shop"
        className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
      >
        Browse products
      </Link>
    </div>
  )
}

export default function CartPage() {
  const hydrated = useHasHydrated()
  const cart = useStore((s) => s.cart)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const items = useMemo(() => toLineItems(cart), [cart])
  const subtotal = items.reduce((sum, li) => sum + li.product.price * li.qty, 0)

  // Avoid a hydration flash: render nothing until the persisted cart is loaded.
  if (!hydrated) {
    return <div className="mx-auto max-w-3xl px-4 py-10" aria-busy="true" />
  }
  if (items.length === 0) return <EmptyCart />

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <h1 className="font-display text-2xl text-foreground">Your cart</h1>
      <ul className="mt-6 divide-y divide-border">
        {items.map((li) => (
          <li key={li.product.id} className="flex items-center gap-4 py-4">
            <ProductImage
              name={li.product.name}
              className="h-16 w-16 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${li.product.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {li.product.name}
              </Link>
              <p className="text-sm text-muted">
                {formatPrice(li.product.price)}
              </p>
            </div>
            <QuantityStepper productId={li.product.id} qty={li.qty} />
            <button
              type="button"
              onClick={() => removeFromCart(li.product.id)}
              aria-label={`Remove ${li.product.name} from cart`}
              className="text-sm text-muted hover:text-foreground"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <span className="text-muted">Subtotal</span>
        <span className="text-lg font-medium text-foreground">
          {formatPrice(subtotal)}
        </span>
      </div>
    </div>
  )
}
