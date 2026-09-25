import { Bone, SkeletonScreen } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <main className="min-h-dvh bg-ground px-4 py-6 sm:px-6 sm:py-10">
      <SkeletonScreen
        label="Checking your account"
        className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-xl items-center justify-center sm:min-h-[calc(100dvh-5rem)]"
      >
        <div className="flex w-full flex-col items-center gap-3 rounded-[28px] bg-white px-5 py-7 shadow-soft sm:px-9 sm:py-9">
          <span className="h-16 w-16 rounded-full bg-hi" />
          <Bone className="mt-2 h-3 w-32" />
          <Bone className="h-4 w-36" />
          <Bone className="mt-3 h-8 w-4/5 rounded-[10px]" />
          <Bone className="h-4 w-3/5" />
          <div className="mt-4 grid w-full gap-2.5 sm:grid-cols-2">
            <Bone className="h-[112px] rounded-tile" />
            <Bone className="h-[112px] rounded-tile" />
          </div>
          <div className="mt-3 grid w-full gap-3 sm:grid-cols-2">
            <Bone className="h-[52px] rounded-full" />
            <Bone className="h-[52px] rounded-full" />
          </div>
        </div>
      </SkeletonScreen>
    </main>
  )
}
