import { Bone, HeaderSkeleton, PropertyGridSkeleton, SearchBarSkeleton, SkeletonScreen } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <SkeletonScreen label="Loading tenants">
      {/* Phone: title and buttons, the filter chips, then tenants by property. */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="flex flex-col gap-2">
            <Bone className="h-7 w-32 rounded-[10px]" />
            <Bone className="h-3.5 w-44" />
          </span>
          <span className="flex gap-2">
            <Bone className="h-11 w-11 rounded-full" />
            <Bone className="h-11 w-11 rounded-full" />
          </span>
        </div>
        <div className="mt-3 flex gap-2 overflow-hidden">
          {['w-14', 'w-24', 'w-20', 'w-24'].map((width, index) => (
            <Bone key={index} className={`h-10 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Bone className="mb-3 h-3 w-40" />
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-3 rounded-[22px] bg-white p-3.5">
              <Bone className="h-[42px] w-[42px] shrink-0 rounded-[14px]" />
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Bone className="h-3.5 w-1/2" />
                <Bone className="h-3 w-2/3" />
              </span>
              <Bone className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: header, search and the property cards. */}
      <div className="hidden space-y-[22px] lg:block">
        <HeaderSkeleton actions={['w-[150px]']} />
        <SearchBarSkeleton />
        <PropertyGridSkeleton />
      </div>
    </SkeletonScreen>
  )
}
