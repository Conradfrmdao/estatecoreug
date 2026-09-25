import { Bone, HeaderSkeleton, SkeletonScreen } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonScreen label="Loading the calendar" className="page-fill space-y-[22px]">
      <HeaderSkeleton eyebrow actions={['w-[100px]', 'w-[250px]']} />
      <div className="flex min-h-0 flex-col gap-5 xl:flex-1 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col rounded-[24px] bg-white p-4 sm:px-6 sm:py-[22px] lg:rounded-card">
          <span className="flex items-center justify-between pb-3.5">
            <Bone className="h-6 w-44 rounded-[10px]" />
            <span className="flex gap-1.5">
              <Bone className="h-11 w-11 rounded-full" />
              <Bone className="h-11 w-11 rounded-full" />
            </span>
          </span>
          <div className="grid grid-cols-7 gap-1.5 pb-2 sm:gap-2">
            {Array.from({ length: 7 }, (_, index) => (
              <Bone key={index} className="mx-auto h-3 w-8" />
            ))}
          </div>
          <div className="grid min-h-[340px] flex-1 grid-cols-7 grid-rows-5 gap-1.5 sm:gap-2">
            {Array.from({ length: 35 }, (_, index) => (
              <span key={index} className="min-h-[4.5rem] rounded-[14px] bg-canvas p-1.5 sm:rounded-[18px] sm:p-2.5">
                <Bone className="h-[26px] w-[26px] rounded-full" />
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-4 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card xl:w-[360px]">
          <Bone className="h-7 w-40 rounded-[10px]" />
          <Bone className="h-4 w-28" />
          <Bone className="h-[84px] w-full rounded-panel" />
          <Bone className="mt-auto h-12 w-full rounded-full" />
        </div>
      </div>
    </SkeletonScreen>
  )
}
