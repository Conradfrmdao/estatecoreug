import { Bone, HeaderSkeleton, PropertyGridSkeleton, SearchBarSkeleton, SkeletonScreen } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonScreen label="Loading units" className="space-y-[22px]">
      <HeaderSkeleton actions={['w-[150px]']} />
      <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
        <div className="flex min-h-[104px] flex-col justify-between gap-3 rounded-[24px] bg-night p-4 sm:min-h-[128px] sm:p-5 lg:rounded-card">
          <Bone tone="dark" className="h-3 w-16" />
          <Bone tone="dark" className="h-8 w-12 rounded-[10px]" />
        </div>
        <div className="flex min-h-[104px] flex-col justify-between gap-3 rounded-[24px] bg-mint p-4 sm:min-h-[128px] sm:p-5 lg:rounded-card">
          <Bone tone="tint" className="h-3 w-16" />
          <Bone tone="tint" className="h-8 w-12 rounded-[10px]" />
        </div>
        <div className="flex min-h-[104px] flex-col justify-between gap-3 rounded-[24px] bg-white p-4 sm:min-h-[128px] sm:p-5 lg:rounded-card">
          <Bone className="h-3 w-16" />
          <Bone className="h-8 w-12 rounded-[10px]" />
        </div>
      </div>
      <SearchBarSkeleton filters={1} />
      <PropertyGridSkeleton />
    </SkeletonScreen>
  )
}
