CREATE TEMP TABLE "estatecore_unpaid_schedule_tenants" ON COMMIT DROP AS
SELECT tenant."id" AS "tenant_id"
FROM "tenants" AS tenant
INNER JOIN "units" AS unit ON unit."id" = tenant."unit_id"
WHERE unit."property_id" = 14
  AND tenant."created_at" >= TIMESTAMPTZ '2026-07-17 00:00:00+03'
  AND tenant."created_at" < TIMESTAMPTZ '2026-07-18 00:00:00+03';

DO $$
DECLARE
  candidate_count integer;
BEGIN
  SELECT count(*)::integer
  INTO candidate_count
  FROM "estatecore_unpaid_schedule_tenants";

  IF candidate_count > 0 AND candidate_count <> 61 THEN
    RAISE EXCEPTION
      'Unexpected next-payment correction scope: % tenants',
      candidate_count;
  END IF;
END $$;

UPDATE "tenants" AS tenant
SET "rent_due_date" = tenant."move_in_date" + INTERVAL '1 month'
FROM "estatecore_unpaid_schedule_tenants" AS correction
WHERE tenant."id" = correction."tenant_id";
