import { abbreviatedAmount, amountDigits } from '@/lib/format'

type MoneyProps = {
  value: number
  /** Abbreviate to 12.5M — KPI tiles only, never a ledger (design §6.13). */
  abbreviate?: boolean
  /** Render the muted "UGX" prefix so the digits win. */
  prefix?: boolean
  /** Show an explicit sign, for activity rows (+550,000 / -510,000). */
  signed?: boolean
  className?: string
}

export default function Money({
  value,
  abbreviate = false,
  prefix = false,
  signed = false,
  className = ''
}: MoneyProps) {
  const negative = value < 0
  const sign = signed ? (negative ? '\u2212' : '+') : negative ? '\u2212' : ''
  const abbreviated = abbreviate ? abbreviatedAmount(value) : null

  return (
    <span
      className={`money ${className}`}
      title={abbreviate ? `UGX ${amountDigits(value)}` : undefined}
    >
      {prefix && <span className="money-prefix">UGX&nbsp;</span>}
      {sign}
      {abbreviated ? (
        <>
          {abbreviated.figure}
          {abbreviated.unit && <span className="text-[0.62em] font-semibold">{abbreviated.unit}</span>}
        </>
      ) : (
        amountDigits(value)
      )}
    </span>
  )
}
