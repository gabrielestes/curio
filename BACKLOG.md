# Backlog

Deliberately **out of scope** for the weekend MVP. Parked here so the build
stays focused — revisit only after the core ships (engine → UI → CI → deploy).

## Cut from the mockups (intentionally)

- **Profile / accounts** — would reopen authentication, the single biggest
  scope trap we closed. Stays out.
- **Favorites / wishlist page** — the ❤️ heart is an _interaction signal_ that
  feeds the recommender (see R8); it is not a saved-items page.
- **Search** — a whole subsystem (indexing, query UI, ranking). Not needed to
  demonstrate the recommendation engine.
- **Collections / category browsing** — category nav drawer + landing pages.
- **Hamburger menu** — bottom nav (mobile) / top bar (desktop) already cover
  navigation.
- **Mini-cart flyout** — the desktop "Your cart" dropdown. Nice UX; the cart
  page covers the requirement. Add only if M3 has spare time.

## Later, if the project grows

- Real product imagery pipeline (licensed/generated assets).
- Persisted wishlist + accounts (depends on auth).
- Embedding-based recommendations as an alternative engine, A/B compared to the
  content-based one.
- Playwright end-to-end smoke test in CI.
