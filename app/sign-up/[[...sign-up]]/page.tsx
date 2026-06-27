import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #e6f7ef 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/estatecoreuglogo.png" alt="EstateCore UG Logo" width={1536} height={1024} className="h-10 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Create your account</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748b' }}>Start managing your rentals with Estate Core Ug</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          afterSignUpUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </main>
  )
}
