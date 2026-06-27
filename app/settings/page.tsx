import { requireCurrentAppUser } from '@/lib/auth'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [dbUser, clerkUser] = await Promise.all([
    requireCurrentAppUser(),
    currentUser()
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>Settings</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#64748b' }}>
          Manage your account profile, localization, and system preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Navigation/Quick Links */}
        <div className="space-y-2">
          <div className="rounded-xl border bg-white p-2" style={{ borderColor: '#e2e8f0' }}>
            <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition"
              style={{ backgroundColor: '#e6f7ef', color: '#00A550' }}>
              Account Profile
            </button>
            <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition text-slate-600 hover:bg-slate-50">
              System Settings
            </button>
          </div>
        </div>

        {/* Settings Panels */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card */}
          <section className="rounded-xl border bg-white p-6 space-y-6"
            style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#1a1a2e' }}>Landlord Profile</h2>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Personal details and login account.</p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
              {clerkUser?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clerkUser.imageUrl}
                  alt={dbUser.name}
                  className="w-16 h-16 rounded-full border-2"
                  style={{ borderColor: '#00A550' }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: '#00A550' }}>
                  {dbUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg" style={{ color: '#1a1a2e' }}>{dbUser.name}</h3>
                <p className="text-sm text-slate-500">{dbUser.email}</p>
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-1.5"
                  style={{ backgroundColor: '#e6f7ef', color: '#00A550' }}>
                  Active Landlord
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition"
                style={{ backgroundColor: '#00A550', boxShadow: '0 4px 14px rgba(0,165,80,0.3)' }}
              >
                Manage Clerk Security
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>

          {/* Preferences Card */}
          <section className="rounded-xl border bg-white p-6 space-y-6"
            style={{ borderColor: '#e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#1a1a2e' }}>Localization & System Defaults</h2>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Regional currency settings for your properties.</p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="field-label">Default Currency</label>
                <div className="field-input bg-slate-50 flex items-center justify-between text-slate-500">
                  <span>Ugandan Shilling (UGX)</span>
                  <span className="font-bold text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">DEFAULT</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  We defaulted the billing currency to Ugandan Shilling (UGX) as requested for Ugandan property owners.
                </p>
              </div>

              <div className="grid gap-2">
                <label className="field-label">Date Format</label>
                <div className="field-input bg-slate-50 flex items-center justify-between text-slate-500">
                  <span>DD/MM/YYYY (en-UG format)</span>
                  <span className="font-bold text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">SYSTEM</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
