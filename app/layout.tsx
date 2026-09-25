import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { clerkVariables } from '@/components/auth/appearance'

/* Self-hosted by next/font: no render-blocking request to Google, and the
   fallback is metric-matched so text does not jump when the font lands. */
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'EstateCore UG',
  description: 'Property Management Solutions for Ugandan Landlords',
  manifest: '/manifest.webmanifest',
  /* Installed to the home screen the page owns the status-bar strip, so the
     page header paints it instead of the OS drawing a white bar. */
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EstateCore UG'
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png'
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#071a0f'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} scroll-smooth`}>
      <body>
        <ClerkProvider appearance={{ variables: clerkVariables }}>{children}</ClerkProvider>
      </body>
    </html>
  )
}
