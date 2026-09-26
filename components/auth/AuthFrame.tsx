import AuthBackButton from '@/components/AuthBackButton'
import { LogoFull } from '@/components/brand/Logo'
import type { ReactNode } from 'react'

export default function AuthFrame({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-canvas px-4 py-4 sm:py-8">
      <div className="page-enter mx-auto w-full max-w-[26rem] pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="mb-5 flex justify-start">
          <AuthBackButton />
        </div>
        <div className="mb-5 flex flex-col items-center text-center">
          <LogoFull tone="forest" width={232} priority className="mb-6" />
          <h1 className="text-[24px] font-extrabold leading-8 tracking-[-0.02em] text-ink">{title}</h1>
          <p className="mt-1 text-[13.5px] font-medium text-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
