ALTER TABLE "tenants"
ADD COLUMN IF NOT EXISTS "billing_start_date" timestamptz;

UPDATE "tenants"
SET "billing_start_date" = "move_in_date"
WHERE "billing_start_date" IS NULL;

ALTER TABLE "tenants"
ALTER COLUMN "billing_start_date" SET NOT NULL;
