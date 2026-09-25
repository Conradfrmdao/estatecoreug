import { Bone, HeaderSkeleton, SkeletonScreen } from '@/components/ui/Skeleton'

function MoneyCardSkeleton() {
  return (
    <div className="flex min-h-[196px] flex-col justify-between gap-4 rounded-card bg-white p-[22px] xl:min-h-0">
      <span className="flex items-center gap-3">
        <Bone className="h-11 w-11 shrink-0 rounded-full" />
        <Bone className="h-3.5 w-32" />
      </span>
      <Bone className="h-9 w-3/4 rounded-[10px]" />
      <Bone className="h-3 w-3/5" />
    </div>
  )
}

function ListRowSkeleton({ tone = 'light' }: { tone?: 'light' | 'tint' }) {
  return (
    <span className="flex items-center gap-3">
      <Bone tone={tone} className="h-9 w-9 shrink-0 rounded-full" />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <Bone tone={tone} className="h-3.5 w-2/5" />
        <Bone tone={tone} className="h-2 w-full rounded-full" />
      </span>
      <Bone tone={tone} className="h-3.5 w-20 shrink-0" />
    </span>
  )
}

export default function Loading() {
  return (
    <SkeletonScreen label="Loading your dashboard" className="lg:h-full">
      {/* Phone: the forest header, month strip, mini stats and who owes. */}
      <div className="safe-top-fill bg-canvas lg:hidden">
        <div className="safe-top rounded-b-[28px] bg-forest px-4 pb-5">
          <div className="flex items-center justify-between">
            <span className="h-10 w-10 rounded-full bg-hi" />
            <span className="flex gap-2">
              <Bone tone="dark" className="h-10 w-10 rounded-full" />
              <Bone tone="dark" className="h-10 w-10 rounded-full" />
            </span>
          </div>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <Bone tone="dark" className="h-2.5 w-24" />
              <Bone tone="dark" className="h-7 w-44 rounded-[10px]" />
              <Bone tone="dark" className="mt-5 h-2.5 w-28" />
              <Bone tone="dark" className="h-8 w-48 rounded-[10px]" />
              <Bone tone="dark" className="h-3 w-36" />
            </div>
            <span className="h-[92px] w-[92px] shrink-0 rounded-full border-[9px] border-white/10" />
          </div>
          <div className="mt-5 flex gap-1.5 overflow-hidden">
            {[0, 1, 2, 3, 4].map((index) => (
              <Bone key={index} tone="dark" className="h-9 w-20 shrink-0 rounded-full" />
            ))}
          </div>
        </div>

        <div className="space-y-4 px-4 pb-6 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2 rounded-[18px] bg-white px-3 py-3">
                <Bone className="h-2.5 w-10" />
                <Bone className="h-5 w-14" />
                <Bone className="h-1 w-full rounded-full" />
              </div>
            ))}
          </div>
          <Bone className="h-[52px] w-full rounded-full" />
          <Bone className="mt-2 h-5 w-36" />
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="rounded-[22px] bg-white p-3.5">
                <ListRowSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: the same grid as the page, card for card. */}
      <div className="hidden grid-cols-1 gap-[22px] pb-[22px] lg:grid lg:min-h-full lg:grid-rows-[auto_auto_auto_auto_76px] xl:h-full xl:grid-rows-[auto_minmax(196px,212fr)_minmax(330px,356fr)_minmax(300px,336fr)_76px]">
        <HeaderSkeleton actions={['w-[284px]', 'hidden xl:block xl:w-[250px]']} />

        <div className="grid min-h-0 grid-cols-2 gap-5 xl:grid-cols-3">
          <div className="contents xl:col-span-2 xl:grid xl:grid-cols-3 xl:gap-5">
            <MoneyCardSkeleton />
            <MoneyCardSkeleton />
            <MoneyCardSkeleton />
          </div>
          <div className="flex min-h-[196px] flex-col justify-between gap-4 rounded-card bg-night px-6 py-[22px] xl:min-h-0">
            <Bone tone="dark" className="h-3.5 w-28" />
            <Bone tone="dark" className="h-9 w-3/4 rounded-[10px]" />
            <span className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <Bone key={index} tone="dark" className="h-10 flex-1 rounded-full" />
              ))}
            </span>
          </div>
        </div>

        <div className="grid min-h-0 gap-5 xl:grid-cols-3">
          <div className="flex min-h-[330px] gap-5 rounded-card bg-white p-5 xl:col-span-2 xl:min-h-0">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <span className="flex items-center justify-between">
                <Bone className="h-5 w-28" />
                <span className="flex gap-1.5">
                  <Bone className="h-10 w-10 rounded-full" />
                  <Bone className="h-10 w-10 rounded-full" />
                </span>
              </span>
              <div className="grid flex-1 grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }, (_, index) => (
                  <Bone key={index} className="aspect-square max-h-11 w-full justify-self-center rounded-full" />
                ))}
              </div>
            </div>
            <div className="hidden w-[250px] shrink-0 flex-col gap-3 rounded-panel bg-canvas p-4 xl:flex">
              <Bone className="h-4 w-32" />
              {[0, 1, 2].map((index) => (
                <span key={index} className="flex items-center gap-2.5">
                  <span className="h-[34px] w-[34px] shrink-0 rounded-[10px] bg-white" />
                  <span className="flex flex-1 flex-col gap-1.5">
                    <Bone className="h-3 w-3/4" />
                    <Bone className="h-2.5 w-1/2" />
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex min-h-[330px] flex-col gap-4 rounded-card bg-hi p-6 xl:min-h-0">
            <Bone tone="tint" className="h-5 w-40" />
            {[0, 1, 2, 3].map((index) => (
              <ListRowSkeleton key={index} tone="tint" />
            ))}
          </div>
        </div>

        <div className="grid min-h-0 gap-5 xl:grid-cols-3">
          <div className="flex min-h-[300px] flex-col gap-4 rounded-card bg-white px-6 py-5 xl:col-span-2 xl:min-h-0">
            <Bone className="h-5 w-40" />
            {[0, 1, 2, 3].map((index) => (
              <span key={index} className="flex items-center gap-4 border-t border-line pt-3.5">
                <Bone className="h-9 w-9 shrink-0 rounded-full" />
                <Bone className="h-3.5 flex-1" />
                <Bone className="h-3.5 w-24" />
                <Bone className="h-3.5 w-20" />
                <Bone className="h-7 w-20 rounded-full" />
              </span>
            ))}
          </div>
          <div className="flex min-h-[300px] flex-col justify-between gap-4 rounded-card bg-mint px-6 py-5 xl:min-h-0">
            <Bone tone="tint" className="h-5 w-32" />
            <Bone tone="tint" className="h-12 w-28 rounded-[12px]" />
            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1, 2, 3].map((index) => (
                <Bone key={index} tone="tint" className="h-[62px] rounded-tile" />
              ))}
            </div>
          </div>
        </div>

        <span className="h-[56px] w-[min(440px,100%)] self-end justify-self-center rounded-full bg-night" />
      </div>
    </SkeletonScreen>
  )
}
