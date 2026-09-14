function OwingRowSkeleton() {
  return (
    <div className="surface-card flex items-center gap-3 p-3.5">
      <span className="skeleton h-9 w-9 shrink-0 rounded-full" />
      <span className="min-w-0 flex-1 space-y-2">
        <span className="skeleton block h-3.5 w-2/5" />
        <span className="skeleton block h-3 w-3/5" />
      </span>
      <span className="w-[96px] shrink-0 space-y-2">
        <span className="skeleton ml-auto block h-4 w-full" />
        <span className="skeleton ml-auto block h-2.5 w-3/4" />
      </span>
    </div>
  )
}

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your dashboard</span>

      {/* Mobile — mirrors the aurora header, mini stats and owing list */}
      <div className="lg:hidden">
        <div className="aurora rounded-b-[22px] px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <span className="h-10 w-10 rounded-[10px] bg-white/10" />
            <span className="h-9 w-9 rounded-full bg-white/10" />
          </div>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <span className="block h-2.5 w-24 rounded bg-white/15" />
              <span className="block h-7 w-40 rounded bg-white/15" />
              <span className="mt-5 block h-2.5 w-28 rounded bg-white/15" />
              <span className="block h-7 w-48 rounded bg-white/15" />
              <span className="block h-3 w-36 rounded bg-white/10" />
            </div>
            <span className="h-[92px] w-[92px] shrink-0 rounded-full border-8 border-white/10" />
          </div>
          <div className="mt-5 flex gap-1.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index} className="h-9 w-16 shrink-0 rounded-full bg-white/10" />
            ))}
          </div>
        </div>

        <div className="space-y-4 px-4 pt-4">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="surface-card space-y-2 px-3 py-2.5">
                <span className="skeleton block h-2.5 w-10" />
                <span className="skeleton block h-5 w-14" />
                <span className="skeleton block h-1 w-full" />
              </div>
            ))}
          </div>
          <span className="skeleton block h-[52px] w-full rounded-[14px]" />
          <div className="space-y-2.5">
            {[0, 1, 2].map((index) => (
              <OwingRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop — mirrors the KPI row, portfolio strip and owing list */}
      <div className="hidden space-y-4 lg:block">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-2.5">
            <span className="skeleton block h-7 w-48" />
            <span className="skeleton block h-4 w-80" />
          </div>
          <div className="flex gap-2.5">
            <span className="skeleton block h-11 w-40" />
            <span className="skeleton block h-11 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="surface-card flex min-h-[132px] gap-3.5 p-5">
              <span className="skeleton w-1 shrink-0 rounded-full" />
              <span className="min-w-0 flex-1 space-y-3">
                <span className="skeleton block h-2.5 w-24" />
                <span className="skeleton block h-6 w-40" />
                <span className="skeleton block h-3 w-32" />
              </span>
            </div>
          ))}
        </div>

        <div className="surface-card grid grid-cols-5 divide-x divide-[var(--line)] px-2 py-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="space-y-2 px-4 py-3">
              <span className="skeleton block h-2.5 w-16" />
              <span className="skeleton block h-6 w-10" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="surface-card space-y-3 p-5">
            <span className="skeleton block h-4 w-40" />
            {[0, 1, 2, 3].map((index) => (
              <OwingRowSkeleton key={index} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="surface-card flex items-center gap-5 p-5">
              <span className="h-[132px] w-[132px] shrink-0 rounded-full border-[16px] border-[var(--neutral-bg)]" />
              <span className="flex-1 space-y-2.5">
                <span className="skeleton block h-3 w-full" />
                <span className="skeleton block h-3 w-4/5" />
                <span className="skeleton block h-3 w-3/5" />
              </span>
            </div>
            <div className="surface-card space-y-3.5 p-5">
              <span className="skeleton block h-4 w-32" />
              {[0, 1, 2].map((index) => (
                <span key={index} className="flex items-center gap-3">
                  <span className="skeleton h-8 w-8 shrink-0 rounded-full" />
                  <span className="flex-1 space-y-1.5">
                    <span className="skeleton block h-3 w-2/3" />
                    <span className="skeleton block h-2.5 w-1/2" />
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
