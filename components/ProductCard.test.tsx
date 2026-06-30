// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ProductCard } from './ProductCard'
import { catalog } from '@/data/catalog'
import { formatPrice } from '@/lib/format'

afterEach(cleanup)

describe('ProductCard', () => {
  const product = catalog[0]

  it('renders the product and links to its detail page', () => {
    render(<ProductCard product={product} />)

    expect(
      screen.getByRole('heading', { name: product.name }),
    ).toBeInTheDocument()
    expect(screen.getByText(formatPrice(product.price))).toBeInTheDocument()
    expect(screen.getByRole('img', { name: product.name })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/product/${product.id}`,
    )
  })
})
