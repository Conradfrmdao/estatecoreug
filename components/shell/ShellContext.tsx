'use client'

import { createContext, useContext } from 'react'

export type ShellUser = {
  name: string
  email: string
  role: 'admin' | 'landlord'
}

export type ShellValue = {
  user: ShellUser
  /** What to call the account holder: their name, or the email when Clerk gave us the email as the name. */
  displayName: string
  initials: string
  roleLabel: string
  isAdmin: boolean
  railExpanded: boolean
}

export const ShellContext = createContext<ShellValue | null>(null)

export function useShell() {
  return useContext(ShellContext)
}

export function initialsFrom(nameOrEmail: string) {
  const base = nameOrEmail.includes('@') ? nameOrEmail.slice(0, nameOrEmail.indexOf('@')) : nameOrEmail
  const parts = base.trim().split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
