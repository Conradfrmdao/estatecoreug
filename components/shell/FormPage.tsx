import BackLink from '@/components/ui/BackLink'
import type { ReactNode } from 'react'
import PageHeader from './PageHeader'

/** The frame every new and edit page shares: back link, title, one white card. */
export default function FormPage({
  backHref,
  backLabel,
  title,
  subtitle,
  children
}: {
  backHref: string
  backLabel: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="stagger mx-auto max-w-2xl space-y-[22px]">
      <div>
        <BackLink href={backHref} label={backLabel} />
      </div>
      <PageHeader title={title} subtitle={subtitle} tools={false} />
      <section className="rounded-[24px] bg-white p-5 sm:p-8 lg:rounded-card">{children}</section>
    </div>
  )
}
