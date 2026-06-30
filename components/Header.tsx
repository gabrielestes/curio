'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CartBadge } from './CartBadge'

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L20 8H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </svg>
  )
}

export function Header() {
  const pathname = usePathname()
  const shopActive =
    pathname.startsWith('/shop') || pathname.startsWith('/product')

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl text-primary">curio</span>
          <span className="hidden text-xs text-muted sm:block">
            Thoughtful finds, chosen for you.
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/shop"
            className={
              shopActive
                ? 'text-foreground'
                : 'text-muted hover:text-foreground'
            }
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 text-muted hover:text-foreground"
          >
            <CartIcon />
            <span>Cart</span>
            <CartBadge />
          </Link>
        </nav>

        {/* Mobile cart shortcut (full nav is the bottom bar) */}
        <Link
          href="/cart"
          aria-label="Cart"
          className="relative inline-flex items-center text-foreground md:hidden"
        >
          <CartIcon />
          <span className="absolute -right-2 -top-2">
            <CartBadge />
          </span>
        </Link>
      </div>
    </header>
  )
}
