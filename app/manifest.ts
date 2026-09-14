import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EstateCore UG',
    short_name: 'EstateCore',
    description: 'Property Management Solutions for Ugandan Landlords',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f7faf8',
    theme_color: '#0a4b3a',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' }
    ]
  }
}
