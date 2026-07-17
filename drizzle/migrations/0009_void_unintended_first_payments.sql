CREATE TEMP TABLE "estatecore_unintended_first_payments" ON COMMIT DROP AS
SELECT
  payment."id" AS "payment_id",
  tenant."id" AS "tenant_id",
  payment."amount_paid" AS "amount_paid"
FROM "rent_payments" AS payment
INNER JOIN "tenants" AS tenant ON tenant."id" = payment."tenant_id"
INNER JOIN "units" AS unit ON unit."id" = tenant."unit_id"
WHERE unit."property_id" = 14
  AND tenant."created_at" >= TIMESTAMPTZ '2026-07-17 00:00:00+03'
  AND tenant."created_at" < TIMESTAMPTZ '2026-07-18 00:00:00+03'
  AND payment."notes" = 'First rent payment from move-in.'
  AND payment."created_at" BETWEEN tenant."created_at" - INTERVAL '5 seconds'
    AND tenant."created_at" + INTERVAL '5 seconds';

DO $$
DECLARE
  candidate_count integer;
  candidate_total bigint;
BEGIN
  SELECT count(*)::integer, COALESCE(sum("amount_paid"), 0)::bigint
  INTO candidate_count, candidate_total
  FROM "estatecore_unintended_first_payments";

  IF candidate_count > 0 AND (candidate_count <> 61 OR candidate_total <> 51650000) THEN
    RAISE EXCEPTION
      'Unexpected first-payment correction scope: % records totaling % UGX',
      candidate_count,
      candidate_total;
  END IF;
END $$;

DELETE FROM "rent_payments" AS payment
USING "estatecore_unintended_first_payments" AS correction
WHERE payment."id" = correction."payment_id";

UPDATE "tenants" AS tenant
SET
  "rent_due_date" = tenant."move_in_date",
  "payment_timing" = 'advance',
  "billing_cycle_months" = 1
FROM "estatecore_unintended_first_payments" AS correction
WHERE tenant."id" = correction."tenant_id";
