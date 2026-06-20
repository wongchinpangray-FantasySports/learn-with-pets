import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
}

/** Bottom clearance: nav tabs + voice badge row + safe-area + small buffer. */
const PAGE_BOTTOM = 'calc(7.75rem + env(safe-area-inset-bottom, 0px) + 0.75rem)'

/** Wraps page content with bottom padding so the fixed nav never covers content. */
export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div
      className={`min-h-screen px-4 pt-6 ${className}`.trim()}
      style={{ paddingBottom: PAGE_BOTTOM }}
    >
      <div className="max-w-lg mx-auto">{children}</div>
    </div>
  )
}
