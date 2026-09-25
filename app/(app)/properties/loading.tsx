import { Bone, HeaderSkeleton, SearchBarSkeleton, SkeletonScreen, TableCardSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonScreen label="Loading properties" className="page-fill space-y-[22px]">
      <HeaderSkeleton actions={['w-[172px]']} />
      <SearchBarSkeleton />
      <div className="flex flex-col rounded-[24px] bg-white lg:flex-1 lg:rounded-card">
        <TableCardSkeleton rows={4} columns={5} className="!bg-transparent" />
        <div className="mx-4 mb-4 mt-auto sm:mx-7 sm:mb-6">
          <Bone className="h-14 w-full rounded-panel" />
        </div>
      </div>
    </SkeletonScreen>
  )
}
