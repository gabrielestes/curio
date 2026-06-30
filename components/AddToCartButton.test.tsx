// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddToCartButton } from './AddToCartButton'
import { CartBadge } from './CartBadge'
import { useStore } from '@/lib/store'

beforeEach(() => {
  useStore.setState({ cart: {}, favorites: [], viewed: [] })
})
afterEach(cleanup)

describe('AddToCartButton', () => {
  it('adds to the cart and the badge reflects the count', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <AddToCartButton productId="ceramic-mug" />
        <CartBadge />
      </div>,
    )

    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(useStore.getState().cart['ceramic-mug']).toBe(1)
    expect(await screen.findByText('1')).toBeInTheDocument()
  })
})
