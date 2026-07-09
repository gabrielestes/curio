import Image from 'next/image'

/**
 * Product image. Renders the catalog's square art edge-to-edge via next/image
 * (SVG assets are served as-is). Falls back to a labelled block when no source
 * is given, so a product without imagery still renders an accessible tile.
 */
export function ProductImage({
  name,
  src,
  className = '',
}: {
  name: string
  src?: string
  className?: string
}) {
  if (!src) {
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

  return (
    <div className={`relative overflow-hidden bg-card ${className}`}>
      <Image
        src={src}
        alt={name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        unoptimized
      />
    </div>
  )
}
