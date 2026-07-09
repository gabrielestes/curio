import { notFound } from 'next/navigation'
import { catalog } from '@/data/catalog'
import { engine } from '@/lib/recommender'
import { formatPrice, formatRating } from '@/lib/format'
import { ProductImage } from '@/components/ProductImage'
import { FavoriteButton } from '@/components/FavoriteButton'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ViewTracker } from '@/components/ViewTracker'
import { RecommendationRail } from '@/components/RecommendationRail'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = catalog.find((p) => p.id === id)
  if (!product) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <ViewTracker productId={product.id} />
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage
          name={product.name}
          src={product.image}
          className="aspect-square w-full rounded-3xl"
        />
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted">{product.category}</p>
            <h1 className="font-display text-3xl text-foreground">
              {product.name}
            </h1>
          </div>
          <p className="text-2xl text-foreground">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm text-muted">
            <span aria-hidden="true">★ </span>
            {formatRating(product.rating)} · {product.reviewCount} reviews
          </p>
          <p className="text-foreground/80">{product.blurb}</p>
          <ul className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-background px-3 py-1 text-xs text-muted ring-1 ring-border"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-3">
            <AddToCartButton productId={product.id} className="flex-1" />
            <FavoriteButton productId={product.id} name={product.name} />
          </div>
        </div>
      </div>
      <RecommendationRail
        title="Similar items"
        recommendations={engine.similarTo(product.id, 4)}
      />
    </div>
  )
}
