/**
 * The always-on "why am I seeing this?" line under a recommended item — the
 * feature that makes Curio's engine legible. Pure and presentational; safe in
 * server or client trees.
 */
export function ReasonBadge({ reason }: { reason: string }) {
  return (
    <p className="mt-1.5 flex gap-1 text-xs leading-snug text-muted">
      <span aria-hidden="true">✦</span>
      <span>
        <span className="font-medium text-foreground/70">Why? </span>
        {reason}
      </span>
    </p>
  )
}
