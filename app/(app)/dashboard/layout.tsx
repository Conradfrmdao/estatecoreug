import type { Viewport } from 'next'
import type { ReactNode } from 'react'

/**
 * On a phone the dashboard paints a forest header behind the status bar, so
 * the browser chrome and the notch/safe area match it rather than the canvas.
 */
export const viewport: Viewport = {
  themeColor: '#0B3D2C'
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children
}
