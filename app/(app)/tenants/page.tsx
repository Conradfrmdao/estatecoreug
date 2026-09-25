import MobileTenants, { type MobileTenantRow } from '@/components/tenants/MobileTenants'
import PropertyCard from '@/components/PropertyCard'
import PropertyTenantsModal from '@/components/PropertyTenantsModal'
import TenantSearchResults from '@/components/TenantSearchResults'
import PageHeader from '@/components/shell/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import SearchBar from '@/components/ui/SearchBar'
import { requireCurrentAppUser } from '@/lib/auth'
import { listPropertiesForUser, listTenantPaymentTargets } from '@/lib/data'
import type { RentStatusKind } from '@/components/ui/StatusPill'
import { currentPaymentMonth, formatDate, shortDate } from '@/lib/format'
import { Plus, UsersRound } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type TenantsPageParams = {
  q?: string
}

export default async function TenantsPage({
  searchParams
}: {
  searchParams?: Promise<TenantsPageParams>
}) {
  const user = await requireCurrentAppUser()
  const params = await searchParams
  const q = (params?.q ?? '').trim().toLowerCase()
  const month = currentPaymentMonth()
  const [properties, tenantRows] = await Promise.all([
    listPropertiesForUser(user.id),
    listTenantPaymentTargets(user.id)
  ])

  const filteredRows = tenantRows.filter(({ tenant, unit, property, nextPaymentDate, displayPaymentStatus }) => {
    if (!q) return true

    return [
      tenant.fullName,
      tenant.phone,
      tenant.email ?? '',
      unit.unitNumber,
      property.name,
      property.location,
      tenant.active ? 'active' : 'inactive',
      formatDate(tenant.moveInDate),
      formatDate(tenant.rentDueDate),
      formatDate(nextPaymentDate),
      displayPaymentStatus
    ].some((value) => value.toLowerCase().includes(q))
  })

  const mobileRows: MobileTenantRow[] = filteredRows.map((row) => {
    const outstanding = row.totalOutstandingBalance
    const nextMonth = row.nextPaymentDate.toISOString().slice(0, 7)
    const monthsAhead =
      (Number(nextMonth.slice(0, 4)) - Number(month.slice(0, 4))) * 12 +
      (Number(nextMonth.slice(5, 7)) - Number(month.slice(5, 7)))

    let statusKind: RentStatusKind = 'due'
    let statusDetail: string | undefined

    if (!row.tenant.active) {
      statusKind = 'inactive'
    } else if (outstanding <= 0) {
      if (monthsAhead > 0) {
        statusKind = 'in_advance'
        statusDetail = `${monthsAhead} mo`
      } else {
        statusKind = 'paid'
      }
    } else if (row.targetAmountPaid > 0) {
      statusKind = 'part_paid'
    } else if (row.totalOutstandingPeriods > 1) {
      statusKind = 'overdue'
      statusDetail = `${row.totalOutstandingPeriods} mo`
    } else {
      statusDetail = shortDate(row.targetDueDate)
    }

    const parts = row.tenant.fullName.trim().split(/\s+/).filter(Boolean)
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (parts[0] ?? '?').slice(0, 2).toUpperCase()

    return {
      id: row.tenant.id,
      name: row.tenant.fullName,
      initials,
      unitNumber: row.unit.unitNumber,
      phone: row.tenant.phone,
      email: row.tenant.email,
      propertyId: row.property.id,
      propertyName: row.property.name,
      active: row.tenant.active,
      balance: outstanding,
      statusKind,
      statusDetail,
      carriedForwardBalance: row.carriedForwardBalance,
      carriedForwardMonths: row.carriedForwardMonths,
      isOwing: outstanding > 0
    } satisfies MobileTenantRow
  })

  const propertyCards = properties
    .map((property) => {
      const allTenants = tenantRows.filter(({ property: rowProperty }) => rowProperty.id === property.id)
      const tenants = filteredRows.filter(({ property: rowProperty }) => rowProperty.id === property.id)
      const propertyMatches = q
        ? [property.name, property.location].some((value) => value.toLowerCase().includes(q))
        : true

      return {
        property,
        allTenants,
        tenants,
        propertyMatches,
        activeCount: allTenants.filter(({ tenant }) => tenant.active).length,
        inactiveCount: allTenants.filter(({ tenant }) => !tenant.active).length
      }
    })
    .filter(({ tenants, propertyMatches }) => !q || propertyMatches || tenants.length > 0)

  return (
    <div>
      <MobileTenants rows={mobileRows} />

      <div className="stagger hidden space-y-[22px] lg:block">
        <PageHeader
          title="Tenants"
          subtitle="Open a property to view and manage only its tenants."
          actions={
            <Link href="/tenants/new" className="btn btn-lg btn-ink">
              <Plus aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.2} />
              New Tenant
            </Link>
          }
        />

        <SearchBar
          action="/tenants"
          defaultValue={params?.q ?? ''}
          placeholder="Search tenant, email, phone, unit, property, or status..."
          label="Search tenant, email, phone, unit, property, or status"
          clearHref={q ? '/tenants' : undefined}
        />

        {q && (
          <TenantSearchResults
            tenants={filteredRows.map(({
              tenant,
              unit,
              property,
              targetMonth,
              targetDueDate,
              nextPaymentDate,
              targetAmountPaid,
              targetBalance,
              targetScheduledBalance,
              totalOutstandingBalance,
              outstandingMonths,
              carriedForwardBalance,
              carriedForwardMonths,
              currentMonthBalance,
              displayPaymentStatus
            }) => ({
              id: tenant.id,
              fullName: tenant.fullName,
              phone: tenant.phone,
              email: tenant.email,
              active: tenant.active,
              moveInDate: tenant.moveInDate.toISOString(),
              nextPaymentDate: nextPaymentDate.toISOString(),
              unitId: unit.id,
              unitNumber: unit.unitNumber,
              unitStatus: unit.status,
              rentAmount: unit.rentAmount,
              propertyId: property.id,
              propertyName: property.name,
              propertyLocation: property.location,
              targetMonth,
              targetDueDate: targetDueDate.toISOString(),
              targetAmountPaid,
              targetBalance,
              targetScheduledBalance,
              totalOutstandingBalance,
              outstandingMonths,
              carriedForwardBalance,
              carriedForwardMonths,
              currentMonthBalance,
              displayPaymentStatus
            }))}
          />
        )}

        {!q && (
          <section aria-label="Properties" className="space-y-4">
            <h2 className="text-[18px] font-extrabold leading-6 text-ink">Properties</h2>
            {propertyCards.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {propertyCards.map(({ property, allTenants, tenants: propertyTenants, activeCount, inactiveCount }) => (
                  <PropertyCard
                    key={property.id}
                    propertyId={property.id}
                    name={property.name}
                    location={property.location}
                    stats={[
                      { label: 'Tenants', value: allTenants.length },
                      { label: 'Active', value: activeCount, tone: 'mint' },
                      { label: 'Inactive', value: inactiveCount }
                    ]}
                  >
                    <PropertyTenantsModal
                      propertyName={property.name}
                      propertyLocation={property.location}
                      tenants={propertyTenants.map(({
                        tenant,
                        unit,
                        nextPaymentDate,
                        totalOutstandingBalance,
                        carriedForwardBalance,
                        carriedForwardMonths,
                        currentMonthBalance,
                        displayPaymentStatus
                      }) => ({
                        id: tenant.id,
                        fullName: tenant.fullName,
                        phone: tenant.phone,
                        email: tenant.email,
                        unitNumber: unit.unitNumber,
                        moveInDate: tenant.moveInDate.toISOString(),
                        nextPaymentDate: nextPaymentDate.toISOString(),
                        totalOutstandingBalance,
                        carriedForwardBalance,
                        carriedForwardMonths,
                        currentMonthBalance,
                        displayPaymentStatus,
                        active: tenant.active
                      }))}
                      downloadHref={`/api/reports/property-detail?month=${month}&propertyId=${property.id}`}
                    />
                  </PropertyCard>
                ))}
              </div>
            ) : (
              <div className="rounded-card bg-white">
                <EmptyState
                  icon={UsersRound}
                  title={properties.length === 0 ? 'No properties yet' : 'No properties match'}
                  body={
                    properties.length === 0
                      ? 'Add a property and its units, then move tenants in.'
                      : 'No properties match this search.'
                  }
                />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
