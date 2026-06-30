import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import AuthBackButton from '@/components/AuthBackButton'

const compactAuthAppearance = {
  variables: {
    colorPrimary: '#00A550',
    borderRadius: '0.75rem'
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: 'w-full border border-slate-200 p-4 shadow-sm sm:p-5',
    header: 'hidden',
    socialButtonsBlockButton: 'h-9 text-sm',
    dividerRow: 'my-2',
    formField: 'mb-2',
    formFieldLabel: 'mb-1 text-xs',
    formFieldInput: 'h-9 text-sm',
    formButtonPrimary: 'h-9 text-sm font-bold',
    footer: 'mt-2 text-xs'
  }
}

export default function SignUpPage() {
  return (
    <main className="flex h-svh items-start justify-center overflow-hidden px-4 pb-4 pt-8 sm:pt-10"
      style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-start">
          <AuthBackButton />
        </div>
        <div className="mb-3 text-center">
          <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#071a0f] ring-1 ring-black/5">
            <Image src="/estatecore-mark.png" alt="EstateCore UG" width={88} height={88} className="h-11 w-11 object-cover" />
          </span>
          <h1 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>Create your account</h1>
          <p className="mt-0.5 text-xs" style={{ color: '#64748b' }}>Start managing your rentals with EstateCore UG</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={compactAuthAppearance}
        />
      </div>
    </main>
  )
}
