/**
 * Placeholder product image. Real photography is an M6 task; until then this
 * renders a tasteful labelled block that also carries the accessible name.
 */
export function ProductImage({
  name,
  className = '',
}: {
  name: string
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center bg-border/50 ${className}`}
    >
      <span className="px-4 text-center font-display text-base text-foreground/45">
        {name}
      </span>
    </div>
  )
}
