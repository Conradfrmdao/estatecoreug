-- Before payment timing was introduced, a tenant with no first payment was still
-- an advance tenant with unpaid rent. Migration 0007 incorrectly marked those
-- historical rows as arrears tenants.
UPDATE "tenants" AS tenant
SET
  "payment_timing" = 'advance',
  "billing_cycle_months" = 1,
  "rent_due_date" = tenant."move_in_date"
WHERE tenant."payment_timing" = 'arrears'
  AND tenant."created_at" < TIMESTAMPTZ '2026-07-16 19:21:04+00'
  AND tenant."rent_due_date" > tenant."move_in_date"
  AND NOT EXISTS (
    SELECT 1
    FROM "rent_payments" AS payment
    WHERE payment."tenant_id" = tenant."id"
  );
