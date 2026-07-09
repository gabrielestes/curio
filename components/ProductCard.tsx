import Link from 'next/link'
import type { Product } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { ProductImage } from './ProductImage'
import { FavoriteButton } from './FavoriteButton'

/**
 * Presentational product card (Server Component). The only interactive leaf is
 * the FavoriteButton island, positioned above the card link so tapping the
 * heart never navigates.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton productId={product.id} name={product.name} />
      </div>
      <Link
        href={`/product/${product.id}`}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ProductImage
          name={product.name}
          src={product.image}
          className="aspect-square w-full"
        />
        <div className="flex flex-1 flex-col gap-0.5 p-4">
          <h3 className="font-medium text-foreground">{product.name}</h3>
          <p className="text-sm text-muted">{product.category}</p>
          <p className="mt-1 font-medium text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </div>
  )
}
