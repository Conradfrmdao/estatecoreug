import { SignIn } from '@clerk/nextjs'
import { authAppearance } from '@/components/auth/appearance'
import AuthFrame from '@/components/auth/AuthFrame'
import type { Viewport } from 'next'

export const viewport: Viewport = { themeColor: '#F5F7F4' }

export default function SignInPage() {
  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to your EstateCore UG account">
      <SignIn
        routing="path"
        path="/sign-in"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
        appearance={authAppearance}
      />
    </AuthFrame>
  )
}
