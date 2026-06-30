import Image from 'next/image'

export default function AppLoading({ label = 'Preparing EstateCore UG' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#071a0f] shadow-lg">
          <Image src="/estatecore-mark.png" alt="EstateCore UG" width={96} height={96} className="h-14 w-14 rounded-xl object-cover" />
          <span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-emerald-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-slate-900">{label}</p>
          <p className="mt-1 text-xs text-slate-500">Loading your secure workspace...</p>
        </div>
      </div>
    </div>
  )
}
