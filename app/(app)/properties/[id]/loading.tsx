import { Bone, HeaderSkeleton, SkeletonScreen, TableCardSkeleton } from '@/components/ui/Skeleton'

function ListCardSkeleton() {
  return (
    <div className="space-y-4 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
      <span className="flex items-center justify-between">
        <Bone className="h-5 w-40" />
        <Bone className="h-9 w-24 rounded-full" />
      </span>
      {[0, 1, 2].map((index) => (
        <span key={index} className="flex items-center gap-3 rounded-tile bg-canvas p-3.5">
          <span className="flex flex-1 flex-col gap-2">
            <Bone className="h-3.5 w-1/2" />
            <Bone className="h-3 w-1/3" />
          </span>
          <Bone className="h-4 w-24" />
        </span>
      ))}
    </div>
  )
}

export default function Loading() {
  return (
    <SkeletonScreen label="Loading the property" className="space-y-[22px]">
      <Bone className="h-9 w-40 rounded-full" />
      <HeaderSkeleton eyebrow actions={['w-[210px]', 'w-[180px]', 'w-[92px]']} tools={false} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex min-h-[112px] flex-col justify-between gap-3 rounded-[24px] bg-white p-5">
            <span className="flex items-center justify-between">
              <Bone className="h-3 w-24" />
              <Bone className="h-4 w-4 rounded-full" />
            </span>
            <Bone className="h-7 w-3/4 rounded-[10px]" />
          </div>
        ))}
      </div>
      <TableCardSkeleton rows={4} columns={6} title />
      <div className="grid gap-5 lg:grid-cols-2">
        <ListCardSkeleton />
        <ListCardSkeleton />
      </div>
    </SkeletonScreen>
  )
}
