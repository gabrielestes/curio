import type { Recommendation } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { ReasonBadge } from './ReasonBadge'

/**
 * A titled grid of recommendations, each product paired with its reason line.
 * Pure and presentational — no hooks, so it renders in both the server product
 * page ("Similar items") and the client home wrapper ("Recommended for you").
 * Renders nothing when there is nothing to show.
 */
export function RecommendationRail({
  title,
  recommendations,
}: {
  title: string
  recommendations: Recommendation[]
}) {
  if (recommendations.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {recommendations.map((rec) => (
          <li key={rec.product.id} className="flex flex-col">
            <ProductCard product={rec.product} />
            <ReasonBadge reason={rec.reason} />
          </li>
        ))}
      </ul>
    </section>
  )
}
