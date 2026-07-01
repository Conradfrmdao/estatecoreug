import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import AuthBackButton from '@/components/AuthBackButton'

const compactAuthAppearance = {
  variables: {
    colorPrimary: '#00A550',
    borderRadius: '0.75rem'
  },
  elements: {
    rootBox: 'w-full max-w-full',
    cardBox: 'w-full max-w-full shadow-none',
    card: 'w-full max-w-full overflow-visible border border-slate-200 p-4 shadow-sm sm:p-5',
    header: 'hidden',
    socialButtonsBlockButton: 'h-10 text-sm',
    dividerRow: 'my-2',
    formField: 'mb-2',
    formFieldLabel: 'mb-1 text-xs',
    formFieldInput: 'h-10 text-base sm:h-9 sm:text-sm',
    formButtonPrimary: 'h-10 text-sm font-bold sm:h-9',
    footer: 'mt-2 text-xs'
  }
}

export default function SignInPage() {
  return (
    <main className="min-h-screen min-h-dvh overflow-x-hidden px-3 py-4 sm:px-4 sm:py-8"
      style={{ backgroundColor: '#f8fafc' }}>
      <div className="mx-auto w-full max-w-[26rem] pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="mb-4 flex justify-start">
          <AuthBackButton />
        </div>
        <div className="mb-3 text-center">
          <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#071a0f] ring-1 ring-black/5">
            <Image src="/estatecore-mark.png" alt="Estate Core UG" width={88} height={88} className="h-11 w-11 object-contain" />
          </span>
          <h1 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>Welcome back</h1>
          <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>Sign in to your EstateCore UG account</p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={compactAuthAppearance}
        />
      </div>
    </main>
  )
}
