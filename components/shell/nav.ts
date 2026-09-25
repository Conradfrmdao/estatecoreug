import {
  Building2,
  CalendarDays,
  ChartColumn,
  Grid2x2,
  House,
  ReceiptText,
  Settings,
  ShieldCheck,
  UsersRound,
  Wallet,
  type LucideIcon
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const baseNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/units', label: 'Units', icon: Grid2x2 },
  { href: '/tenants', label: 'Tenants', icon: UsersRound },
  { href: '/payments', label: 'Payments', icon: Wallet },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/reports', label: 'Reports', icon: ChartColumn },
  { href: '/settings', label: 'Settings', icon: Settings }
]

export const adminNavItem: NavItem = { href: '/admin', label: 'Admin', icon: ShieldCheck }

/* The phone's bottom bar carries four destinations; everything else lives in More. */
export const mobileNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/tenants', label: 'Tenants', icon: UsersRound },
  { href: '/payments', label: 'Payments', icon: Wallet },
  { href: '/properties', label: 'Property', icon: Building2 }
]

export const moreRoutes = ['/units', '/expenses', '/calendar', '/reports', '/settings', '/admin']

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
