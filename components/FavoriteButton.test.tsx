// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FavoriteButton } from './FavoriteButton'
import { useStore } from '@/lib/store'

beforeEach(() => {
  useStore.setState({ cart: {}, favorites: [], viewed: [] })
})
afterEach(cleanup)

describe('FavoriteButton', () => {
  it('toggles favorite state and reflects it in aria-pressed', async () => {
    const user = userEvent.setup()
    render(
      <FavoriteButton productId="leather-wallet" name="Slim Leather Wallet" />,
    )

    const button = screen.getByRole('button', {
      name: /add slim leather wallet to favorites/i,
    })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)

    expect(useStore.getState().favorites).toContain('leather-wallet')
    expect(
      screen.getByRole('button', {
        name: /remove slim leather wallet from favorites/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
