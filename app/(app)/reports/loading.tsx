import { Bone, HeaderSkeleton, SkeletonScreen, StatCardSkeleton, TableCardSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonScreen label="Loading reports" className="space-y-5">
      <HeaderSkeleton actions={['w-[250px]', 'w-[310px]', 'w-[92px]']} tools={false} />
      <div className="flex flex-col gap-4 rounded-[24px] bg-white p-5 sm:px-6 sm:py-[22px] lg:rounded-card">
        <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex flex-col gap-2">
            <Bone className="h-5 w-40" />
            <Bone className="h-3.5 w-64 max-w-full" />
          </span>
          <Bone className="h-12 w-full rounded-full sm:w-[330px]" />
        </span>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className="skeleton-on-tint block h-14 rounded-full bg-mint" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton tone="night" />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <TableCardSkeleton rows={4} columns={6} title avatar={false} actions={false} className="xl:col-span-2" />
        <div className="flex min-h-[260px] flex-col gap-4 rounded-[24px] bg-mint p-5 sm:p-6 lg:rounded-card">
          <Bone tone="tint" className="h-5 w-40" />
          <Bone tone="tint" className="w-full flex-1 rounded-panel" />
        </div>
      </div>
    </SkeletonScreen>
  )
}
