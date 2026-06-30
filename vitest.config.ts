import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the tsconfig "@/*" path alias so tests resolve the same imports.
    alias: { '@': root },
  },
  test: {
    // Engine/store tests run in node; component tests opt into jsdom per-file
    // via a `// @vitest-environment jsdom` pragma.
    environment: 'node',
    include: ['{app,components,data,lib}/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
