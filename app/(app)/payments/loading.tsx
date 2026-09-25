import { Bone, HeaderSkeleton, PropertyGridSkeleton, SkeletonScreen } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonScreen label="Loading payments" className="space-y-[22px]">
      <HeaderSkeleton actions={['w-[170px]']} />
      <div className="grid gap-3 rounded-[24px] bg-white p-4 sm:p-5 lg:rounded-card xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_190px_auto_auto] xl:items-end">
        {['', '', '', ''].map((_, index) => (
          <span key={index} className="flex flex-col gap-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-[52px] w-full rounded-full" />
          </span>
        ))}
        <Bone className="h-[52px] w-full rounded-full xl:w-24" />
        <Bone className="h-[52px] w-full rounded-full xl:w-20" />
      </div>
      <div className="flex flex-col gap-3 rounded-[24px] bg-white p-4 sm:flex-row sm:items-center sm:p-5 lg:rounded-card">
        <span className="flex flex-1 flex-col gap-2">
          <Bone className="h-3 w-28" />
          <Bone className="h-7 w-44 rounded-[10px]" />
        </span>
        <span className="flex flex-1 flex-col gap-2">
          <Bone className="h-3 w-28" />
          <Bone className="h-7 w-40 rounded-[10px]" />
        </span>
        <Bone className="h-9 w-40 rounded-full" />
      </div>
      <PropertyGridSkeleton columns={2} />
    </SkeletonScreen>
  )
}
