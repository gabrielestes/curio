import type { Product } from './types'
import { buildVectorSpace, vectorize, type VectorSpace } from './vectorize'

export function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

export function magnitude(v: number[]): number {
  return Math.sqrt(dot(v, v))
}

/**
 * Cosine similarity for non-negative feature vectors → always in [0, 1].
 * Returns 0 when either vector has zero magnitude (nothing to compare). The
 * final clamp guards against tiny floating-point overshoot past 1.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a)
  const magB = magnitude(b)
  if (magA === 0 || magB === 0) return 0
  const cos = dot(a, b) / (magA * magB)
  return Math.min(1, Math.max(0, cos))
}

/** `matrix[a][b]` = cosine similarity of products a and b (matrix[a][a] === 1). */
export type SimilarityMatrix = Record<string, Record<string, number>>

/**
 * Precompute the full product×product similarity matrix once. Vectors are
 * computed a single time and reused for every pair. Callers cache the result at
 * module scope (see `recommender.ts`), so this is O(n²) work paid only at boot.
 */
export function buildSimilarityMatrix(
  products: Product[],
  space: VectorSpace = buildVectorSpace(products),
): SimilarityMatrix {
  const vectors = new Map(products.map((p) => [p.id, vectorize(p, space)]))
  const matrix: SimilarityMatrix = {}
  for (const a of products) {
    const row: Record<string, number> = {}
    const va = vectors.get(a.id)!
    for (const b of products) {
      row[b.id] = cosineSimilarity(va, vectors.get(b.id)!)
    }
    matrix[a.id] = row
  }
  return matrix
}
