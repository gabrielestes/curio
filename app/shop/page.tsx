import { catalog } from '@/data/catalog'
import { ProductCard } from '@/components/ProductCard'

export const metadata = {
  title: 'Shop — Curio',
}

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="font-display text-2xl text-foreground">
        Shop all products
      </h1>
      <p className="mt-1 text-sm text-muted">
        {catalog.length} thoughtfully chosen goods.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {catalog.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
