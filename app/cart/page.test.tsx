// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import CartPage from './page'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/format'

beforeEach(() => {
  useStore.setState({ cart: {}, favorites: [], viewed: [] })
})
afterEach(cleanup)

describe('CartPage', () => {
  it('shows an empty state when the cart is empty', async () => {
    render(<CartPage />)
    expect(await screen.findByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('lists line items and the subtotal', async () => {
    useStore.setState({
      cart: { 'leather-wallet': 1, 'ceramic-mug': 2 },
      favorites: [],
      viewed: [],
    })
    render(<CartPage />)

    expect(
      await screen.findByRole('link', { name: 'Slim Leather Wallet' }),
    ).toBeInTheDocument()
    // $39 + $18 × 2 = $75
    expect(screen.getByText(formatPrice(75))).toBeInTheDocument()
  })
})
