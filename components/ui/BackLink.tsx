import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-white py-2 pl-3 pr-4 text-[13.5px] font-bold text-ink-soft transition hover:text-ink hover:shadow-soft"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.2} />
      {label}
    </Link>
  )
}
