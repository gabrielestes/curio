import Link from 'next/link'
import { engine } from '@/lib/recommender'
import { ProductCard } from '@/components/ProductCard'

function Hero() {
  return (
    <section className="overflow-hidden rounded-3xl bg-primary text-primary-foreground">
      <div className="grid gap-6 p-8 md:grid-cols-2 md:p-12">
        <div className="flex flex-col justify-center gap-4">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Discover things you&rsquo;ll love.
          </h1>
          <p className="max-w-sm text-primary-foreground/80">
            Smart recommendations. Always explainable.
          </p>
          <Link
            href="/shop"
            className="w-fit rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Shop all products
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="hidden min-h-48 rounded-2xl bg-primary-foreground/10 md:block"
        />
      </div>
    </section>
  )
}

export default function HomePage() {
  // Bestselling = the engine's popularity ranking (R4 fallback surface). The
  // personalized "Recommended for you" rail plugs in here in M4.
  const bestselling = engine.popular(8)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <Hero />

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl text-foreground">
            Bestselling products
          </h2>
          <Link
            href="/shop"
            className="text-sm text-muted hover:text-foreground"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bestselling.map((rec) => (
            <ProductCard key={rec.product.id} product={rec.product} />
          ))}
        </div>
      </section>
    </div>
  )
}
