import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EstateCore UG',
    short_name: 'EstateCore',
    description: 'Property Management Solutions for Ugandan Landlords',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F5F7F4',
    theme_color: '#0B3D2C',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg?v=2', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
    ]
  }
}
