import type { TenantRentStatus } from '@/lib/rent-cycle'

/**
 * The semantic set from artboard 1a: Paid - In advance - Part paid - Due (date) - Overdue.
 * "Cleared" is retired (design §6.4) - a tenant with no payment on record is Due.
 */
export type RentStatusKind =
  | 'paid'
  | 'in_advance'
  | 'part_paid'
  | 'due'
  | 'overdue'
  | 'vacant'
  | 'inactive'

const presentation: Record<RentStatusKind, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-[var(--paid-bg)] text-[var(--paid-fg)]' },
  in_advance: { label: 'In advance', className: 'bg-[var(--advance-bg)] text-[var(--advance-fg)]' },
  part_paid: { label: 'Part paid', className: 'bg-[var(--carried-bg)] text-[var(--carried-fg)]' },
  due: { label: 'Due', className: 'bg-[var(--due-bg)] text-[var(--due-fg)]' },
  overdue: { label: 'Overdue', className: 'bg-[var(--overdue-bg)] text-[var(--overdue-fg)]' },
  vacant: { label: 'Vacant', className: 'border border-dashed border-[var(--line-strong)] text-[var(--text-muted)]' },
  inactive: { label: 'Inactive', className: 'border border-dashed border-[var(--line-strong)] text-[var(--text-muted)]' }
}

/**
 * Maps the rent status the app already computes onto the display vocabulary.
 * Pure presentation - no balance is recalculated here.
 */
export function rentStatusKind(status: TenantRentStatus): RentStatusKind {
  if (status === 'paid') return 'paid'
  if (status === 'partial') return 'part_paid'
  if (status === 'overdue') return 'overdue'
  return 'due'
}

export function rentStatusLabel(kind: RentStatusKind) {
  return presentation[kind].label
}

export default function StatusPill({
  kind,
  detail,
  className = ''
}: {
  kind: RentStatusKind
  /** Appended after the label - "15 Sep" gives "Due 15 Sep", "2 mo" gives "Overdue - 2 mo". */
  detail?: string
  className?: string
}) {
  const tone = presentation[kind]
  const separator = kind === 'due' ? ' ' : ' \u00b7 '

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${tone.className} ${className}`}
    >
      {tone.label}
      {detail ? `${separator}${detail}` : ''}
    </span>
  )
}
