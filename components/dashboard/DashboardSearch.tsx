'use client'

import { useShell } from '@/components/shell/ShellContext'
import { Search } from 'lucide-react'
import Form from 'next/form'

/**
 * "Search tenants or units" - runs the Tenants page search. When the menu is
 * open it folds to an icon to make room, and opens again when focused.
 */
export default function DashboardSearch() {
  const shell = useShell()
  const folded = shell?.railExpanded ?? false

  return (
    <Form
      action="/tenants"
      role="search"
      className={`search-field hidden h-[52px] overflow-hidden bg-white px-[17px] transition-[width,border-color,box-shadow] duration-[400ms] ease-rail xl:flex ${
        folded ? 'w-[52px] focus-within:w-[250px]' : 'w-[250px]'
      }`}
    >
      <label htmlFor="dashboard-search" className="shrink-0 cursor-text">
        <Search aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
        <span className="sr-only">Search tenants or units</span>
      </label>
      <input id="dashboard-search" name="q" type="search" placeholder="Search tenants or units" autoComplete="off" />
    </Form>
  )
}
