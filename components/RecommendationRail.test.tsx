// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { RecommendationRail } from './RecommendationRail'
import { catalog } from '@/data/catalog'
import type { Recommendation } from '@/lib/types'

afterEach(cleanup)

function recs(n: number): Recommendation[] {
  return catalog.slice(0, n).map((product, i) => ({
    product,
    score: n - i,
    reason: `Reason for ${product.name}`,
    sourceId: null,
  }))
}

describe('RecommendationRail', () => {
  it('renders each recommendation with its product and reason', () => {
    render(
      <RecommendationRail title="Similar items" recommendations={recs(3)} />,
    )

    expect(
      screen.getByRole('heading', { name: 'Similar items' }),
    ).toBeInTheDocument()
    for (const product of catalog.slice(0, 3)) {
      expect(
        screen.getByRole('heading', { name: product.name }),
      ).toBeInTheDocument()
      expect(screen.getByText(`Reason for ${product.name}`)).toBeInTheDocument()
    }
  })

  it('renders nothing when there are no recommendations', () => {
    const { container } = render(
      <RecommendationRail title="Similar items" recommendations={[]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
