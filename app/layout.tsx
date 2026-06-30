import './globals.css'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'EstateCore UG',
  description: 'Property Management Solutions for Ugandan Landlords',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png'
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  )
}
