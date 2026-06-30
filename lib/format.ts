const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Format a dollar amount, e.g. 39 → "$39.00". */
export function formatPrice(amount: number): string {
  return usd.format(amount)
}

/** One-decimal rating, e.g. 4.7 → "4.7". */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}
