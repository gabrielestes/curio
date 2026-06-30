import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The engine is pure TypeScript — no DOM needed. Component tests (M3) will
    // opt into jsdom per-file once the UI exists.
    environment: 'node',
    include: ['{lib,data}/**/*.test.ts'],
  },
})
