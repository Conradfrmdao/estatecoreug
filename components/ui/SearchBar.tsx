import { Search } from 'lucide-react'
import Form from 'next/form'
import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * The search strip that sits under a page header: a pill field, any extra
 * filters, and the lime button. It submits as a client-side navigation, so
 * the shell stays put while the results load.
 */
export default function SearchBar({
  action,
  name = 'q',
  defaultValue = '',
  placeholder,
  label,
  hidden,
  buttonLabel = 'Search',
  clearHref,
  children
}: {
  action: string
  name?: string
  defaultValue?: string
  placeholder: string
  label: string
  /** Params to carry through the search, such as a month filter. */
  hidden?: Record<string, string>
  buttonLabel?: string
  clearHref?: string
  children?: ReactNode
}) {
  return (
    <Form
      action={action}
      role="search"
      className="flex flex-col gap-3 rounded-[24px] bg-white p-3 sm:flex-row sm:items-center lg:rounded-card"
    >
      {hidden &&
        Object.entries(hidden).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <label className="search-field min-w-0 sm:flex-1">
        <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        <span className="sr-only">{label}</span>
        <input name={name} type="search" defaultValue={defaultValue} placeholder={placeholder} autoComplete="off" />
      </label>
      {children}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-lg btn-hi flex-1 px-[30px] sm:flex-none">
          {buttonLabel}
        </button>
        {clearHref && (
          <Link href={clearHref} className="btn btn-lg btn-outline">
            Clear
          </Link>
        )}
      </div>
    </Form>
  )
}
