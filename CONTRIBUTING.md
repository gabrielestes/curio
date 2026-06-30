# Contributing to Curio

Curio is a portfolio project, so the engineering discipline is part of the
product. These are the **hard reference standards** we adhere to — specific,
checkable rules, each with a canonical source.

## Project layout

| Path          | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `lib/`        | Pure logic — the recommendation engine. No React, no I/O. |
| `data/`       | The seed catalog (single source of product data).         |
| `app/`        | Next.js App Router pages + API routes (UI phase).         |
| `components/` | UI components (UI phase).                                 |

Pure logic stays out of components; components stay thin.

## React / Next.js

References: [Rules of React](https://react.dev/reference/rules) ·
[Thinking in React](https://react.dev/learn/thinking-in-react) ·
[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) ·
[Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

- Components are pure; no side effects during render. Derive state — don't sync
  it with `useEffect`.
- Server Components by default; add `"use client"` only where interactivity
  lives. Keep the client bundle small.
- Data flows down via props; reach for the store before prop-drilling past two
  levels. Stable `key`s come from product ids, never the array index.

## TypeScript

References: [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) ·
[typescript-eslint](https://typescript-eslint.io/rules/)

- `strict: true`. No `any` — use `unknown` + narrowing at boundaries.
- Domain types live once in [`lib/types.ts`](lib/types.ts) and are imported
  everywhere.

## Testing

References: [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles/) ·
[The Testing Trophy](https://kentcdodds.com/blog/write-tests) ·
[Vitest](https://vitest.dev/guide/)

- Test behavior, not implementation. Query UI by role / accessible name.
- Arrange–Act–Assert; descriptive names; deterministic (no real network, no
  time/random dependence).
- The pure engine (`lib/`) carries the heaviest coverage; no blanket snapshots.

## Styling / a11y / Git

References: [Tailwind](https://tailwindcss.com/docs/styling-with-utility-classes) ·
[Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction) ·
[WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) ·
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

- Tailwind utilities first; extract a component only when a class string repeats
  3+ times. Theme tokens in config — no magic hex in JSX.
- Keyboard-navigable, semantic elements, `alt` on every image, AA contrast.
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  (`feat:`, `fix:`, `test:`, `chore:`), small and focused.

## Commands

```bash
npm run dev          # start the dev server
npm run test         # watch-mode unit tests
npm run test:run     # single test run (CI)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
```
