# Estate Core UG Security And QA Checklist

Run this after applying migrations and setting `ADMIN_EMAILS`.

## Required Environment

- `.env.local` must stay ignored and untracked.
- `ADMIN_EMAILS` must include at least one platform owner email.
- Existing users are migrated as approved landlords; new non-admin users start as pending.

## End-To-End Flow

1. Sign up with a non-admin Clerk account.
2. Confirm the account lands on `/pending-approval` and cannot access `/dashboard`, app APIs, or `/admin`.
3. Sign in as an email listed in `ADMIN_EMAILS`.
4. Open `/admin`, approve the pending user, then sign in as that user again.
5. Add a property, add a vacant unit, then add a tenant with a move-in date.
6. Select `1`, `3`, `6`, `12`, and custom payment durations and confirm the next due date is calculated from move-in.
7. Create a tenant with first payment enabled and confirm a payment record is created with the matching coverage window.
8. Attempt to add another active tenant to the same unit and confirm the API returns a conflict.
9. Record a later rent payment with multi-month coverage and confirm the tenant due date advances.
10. Check `/dashboard?month=YYYY-MM` for correct expected rent, collected rent, outstanding balance, and paid/partial/overdue state.
11. Check `/calendar` month/week/day views for move-in, due, overdue, payment, and expense events.
12. Download a receipt and confirm it shows `Rent Receipt`, `Estate Core UG Property Management Solutions`, tenant, property, unit, payment, and balance details.
13. Delete a property and confirm its units, tenants, rent payments, and linked expenses are removed.
14. Sign in as a second approved user and verify direct URLs/API IDs from the first user return not found or unauthorized behavior.
15. Test phone, tablet, laptop, and desktop widths for no table/form/card overflow.

## Verification Commands

```bash
npm run test:rent-cycle
npm run lint
npm run build
npm audit
```

`npm audit` currently reports moderate transitive advisories in Next/Drizzle tooling where the offered force fixes are breaking downgrades. Do not run `npm audit fix --force` without reviewing the dependency impact.
