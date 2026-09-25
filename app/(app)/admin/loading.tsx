import { HeaderSkeleton, SkeletonScreen, StatCardSkeleton, TableCardSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonScreen label="Loading the admin panel" className="space-y-5">
      <HeaderSkeleton eyebrow actions={['w-[150px]']} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton tone="night" />
      </div>
      <TableCardSkeleton rows={4} columns={7} title />
    </SkeletonScreen>
  )
}
