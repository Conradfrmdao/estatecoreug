import { LogoFull } from '@/components/brand/Logo'
import { Bone, SkeletonScreen } from '@/components/ui/Skeleton'

/** The sign-up page's frame while Clerk's form loads. */
export default function Loading() {
  return (
    <main className="min-h-dvh bg-canvas px-4 py-4 sm:py-8">
      <SkeletonScreen label="Opening sign up" className="mx-auto w-full max-w-[26rem]">
        <Bone className="mb-5 h-10 w-24 rounded-full" />
        <div className="mb-5 flex flex-col items-center gap-2.5">
          <LogoFull tone="forest" width={232} className="mb-3.5" />
          <Bone className="h-7 w-48 rounded-[10px]" />
          <Bone className="h-3.5 w-64" />
        </div>
        <div className="space-y-4 rounded-[24px] bg-white p-5 shadow-soft sm:p-6">
          <Bone className="h-11 w-full rounded-[14px]" />
          <Bone className="mx-auto h-3 w-10" />
          <div className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-11 w-full rounded-[14px]" />
          </div>
          <Bone className="h-11 w-full rounded-[14px]" />
        </div>
      </SkeletonScreen>
    </main>
  )
}
