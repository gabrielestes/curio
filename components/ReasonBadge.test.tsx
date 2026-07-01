// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ReasonBadge } from './ReasonBadge'

afterEach(cleanup)

describe('ReasonBadge', () => {
  it('renders the reason text', () => {
    render(<ReasonBadge reason="Same category · shares tags: leather" />)
    expect(
      screen.getByText(/same category · shares tags: leather/i),
    ).toBeInTheDocument()
  })
})
