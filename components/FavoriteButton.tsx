'use client'

import { useStore } from '@/lib/store'
import { useHasHydrated } from '@/lib/useHasHydrated'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 20.5 4.2 12.7a4.6 4.6 0 0 1 6.5-6.5l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 6.5L12 20.5Z" />
    </svg>
  )
}

/**
 * Heart toggle present on every card. Tapping it records a `favorite`
 * interaction (the strongest signal feeding the recommender — R8). It is a
 * signal only; there is no wishlist page.
 */
export function FavoriteButton({
  productId,
  name,
}: {
  productId: string
  name: string
}) {
  const hydrated = useHasHydrated()
  const favorited = useStore((s) => s.favorites.includes(productId))
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const active = hydrated && favorited

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(productId)}
      aria-pressed={active}
      aria-label={
        active ? `Remove ${name} from favorites` : `Add ${name} to favorites`
      }
      className={`grid h-9 w-9 place-items-center rounded-full bg-card/90 shadow-sm ring-1 ring-border backdrop-blur transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active ? 'text-primary' : 'text-foreground/70'
      }`}
    >
      <HeartIcon filled={active} />
    </button>
  )
}
