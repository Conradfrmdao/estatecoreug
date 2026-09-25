import { Bone, HeaderSkeleton, SkeletonScreen } from '@/components/ui/Skeleton'

function RowsCard({ rows, grid = false }: { rows: number; grid?: boolean }) {
  return (
    <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 sm:p-6 lg:rounded-card">
      <span className="flex items-center gap-3.5">
        <Bone className="h-[52px] w-[52px] shrink-0 rounded-2xl" />
        <span className="flex flex-1 flex-col gap-2">
          <Bone className="h-4 w-2/5" />
          <Bone className="h-3 w-3/5" />
        </span>
      </span>
      <div className={grid ? 'grid grid-cols-2 gap-2.5' : 'flex flex-col gap-2.5'}>
        {Array.from({ length: rows }, (_, index) => (
          <Bone key={index} className="h-[70px] rounded-tile" />
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <SkeletonScreen label="Loading settings" className="space-y-[22px]">
      <HeaderSkeleton eyebrow />
      <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-3">
        <RowsCard rows={4} grid />
        <RowsCard rows={3} />
        <RowsCard rows={2} />
      </div>
      <div className="flex items-center gap-5 rounded-[24px] bg-night p-5 sm:px-7 sm:py-[26px] lg:rounded-card">
        <span className="h-14 w-14 shrink-0 rounded-full bg-hi" />
        <span className="flex flex-1 flex-col gap-2">
          <Bone tone="dark" className="h-4 w-32" />
          <Bone tone="dark" className="h-3 w-3/5" />
        </span>
        <Bone tone="dark" className="hidden h-[52px] w-40 rounded-full sm:block" />
      </div>
    </SkeletonScreen>
  )
}
