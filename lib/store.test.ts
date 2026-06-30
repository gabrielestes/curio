import { describe, it, expect, beforeEach } from 'vitest'
import { useStore, toLineItems, selectCartCount, selectSubtotal } from './store'

beforeEach(() => {
  useStore.setState({ cart: {}, favorites: [], viewed: [] })
})

describe('cart', () => {
  it('adds items and accumulates quantity', () => {
    useStore.getState().addToCart('leather-wallet')
    useStore.getState().addToCart('leather-wallet', 2)
    expect(useStore.getState().cart['leather-wallet']).toBe(3)
    expect(selectCartCount(useStore.getState())).toBe(3)
  })

  it('setQty removes the line at zero', () => {
    useStore.getState().addToCart('ceramic-mug')
    useStore.getState().setQty('ceramic-mug', 0)
    expect(useStore.getState().cart['ceramic-mug']).toBeUndefined()
  })

  it('removeFromCart deletes the line', () => {
    useStore.getState().addToCart('ceramic-mug')
    useStore.getState().removeFromCart('ceramic-mug')
    expect(selectCartCount(useStore.getState())).toBe(0)
  })

  it('joins to catalog and computes the subtotal', () => {
    useStore.getState().addToCart('leather-wallet') // $39
    useStore.getState().addToCart('ceramic-mug', 2) // $18 × 2
    const items = toLineItems(useStore.getState().cart)
    expect(items.map((li) => li.product.id)).toEqual([
      'ceramic-mug',
      'leather-wallet',
    ]) // sorted by name
    expect(selectSubtotal(useStore.getState())).toBe(39 + 18 * 2)
  })
})

describe('favorites', () => {
  it('toggles on and off', () => {
    useStore.getState().toggleFavorite('field-watch')
    expect(useStore.getState().favorites).toContain('field-watch')
    useStore.getState().toggleFavorite('field-watch')
    expect(useStore.getState().favorites).not.toContain('field-watch')
  })
})

describe('view history', () => {
  it('records most-recent-first and de-dupes', () => {
    useStore.getState().recordView('x')
    useStore.getState().recordView('y')
    useStore.getState().recordView('x')
    expect(useStore.getState().viewed).toEqual(['x', 'y'])
  })

  it('caps history length', () => {
    for (let i = 0; i < 25; i++) useStore.getState().recordView(`p${i}`)
    expect(useStore.getState().viewed).toHaveLength(20)
    expect(useStore.getState().viewed[0]).toBe('p24')
  })
})
