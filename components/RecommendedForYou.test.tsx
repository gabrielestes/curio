// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { RecommendedForYou } from './RecommendedForYou'
import { useStore } from '@/lib/store'
import { catalog } from '@/data/catalog'
import type { RecommendationResponse } from '@/lib/types'

function mockFetch(response: RecommendationResponse) {
  const fetchMock = vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(response) } as Response),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  useStore.setState({ cart: {}, favorites: [], viewed: [] })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('RecommendedForYou', () => {
  it('fetches and renders a personalized rail when there is history', async () => {
    const rec = {
      product: catalog[0],
      score: 1,
      reason: 'Based on your interest',
      sourceId: catalog[1].id,
    }
    const fetchMock = mockFetch({
      kind: 'personalized',
      recommendations: [rec],
    })
    useStore.setState({ viewed: [catalog[1].id] })

    render(<RecommendedForYou />)

    expect(
      await screen.findByRole('heading', { name: 'Recommended for you' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: catalog[0].name }),
    ).toBeInTheDocument()
    expect(screen.getByText('Based on your interest')).toBeInTheDocument()

    // Signals from the store were POSTed to the API.
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recommendations',
      expect.objectContaining({ method: 'POST' }),
    )
    const [, init] = (fetchMock.mock.calls[0] ?? []) as unknown as [
      unknown,
      RequestInit?,
    ]
    const body = JSON.parse(init?.body as string)
    expect(body.viewedIds).toContain(catalog[1].id)
  })

  it('renders nothing and does not fetch with no history', () => {
    const fetchMock = mockFetch({ kind: 'popular', recommendations: [] })
    const { container } = render(<RecommendedForYou />)
    expect(container).toBeEmptyDOMElement()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
