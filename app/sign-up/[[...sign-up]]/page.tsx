import { SignUp } from '@clerk/nextjs'
import { authAppearance } from '@/components/auth/appearance'
import AuthFrame from '@/components/auth/AuthFrame'
import type { Viewport } from 'next'

export const viewport: Viewport = { themeColor: '#F5F7F4' }

export default function SignUpPage() {
  return (
    <AuthFrame title="Create your account" subtitle="Start managing your rentals with EstateCore UG">
      <SignUp
        routing="path"
        path="/sign-up"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        appearance={authAppearance}
      />
    </AuthFrame>
  )
}
