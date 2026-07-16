ALTER TABLE "tenants"
ADD COLUMN IF NOT EXISTS "payment_timing" varchar(50) DEFAULT 'advance' NOT NULL;

ALTER TABLE "tenants"
ADD COLUMN IF NOT EXISTS "billing_cycle_months" integer DEFAULT 1 NOT NULL;

UPDATE "tenants" AS tenant
SET
  "payment_timing" = 'arrears',
  "billing_cycle_months" = GREATEST(
    1,
    (
      EXTRACT(YEAR FROM AGE(tenant."rent_due_date", tenant."move_in_date")) * 12 +
      EXTRACT(MONTH FROM AGE(tenant."rent_due_date", tenant."move_in_date"))
    )::integer
  )
WHERE tenant."rent_due_date" > tenant."move_in_date"
  AND NOT EXISTS (
    SELECT 1
    FROM "rent_payments" AS payment
    WHERE payment."tenant_id" = tenant."id"
  );

ALTER TABLE "support_conversations"
ADD COLUMN IF NOT EXISTS "landlord_read_at" timestamptz;

ALTER TABLE "support_conversations"
ADD COLUMN IF NOT EXISTS "admin_read_at" timestamptz;

UPDATE "support_conversations" AS conversation
SET
  "landlord_read_at" = COALESCE(
    conversation."landlord_read_at",
    (
      SELECT MAX(message."created_at")
      FROM "support_messages" AS message
      WHERE message."conversation_id" = conversation."id"
        AND message."sender_role" <> 'admin'
    ),
    conversation."created_at"
  ),
  "admin_read_at" = COALESCE(
    conversation."admin_read_at",
    (
      SELECT MAX(message."created_at")
      FROM "support_messages" AS message
      WHERE message."conversation_id" = conversation."id"
        AND message."sender_role" = 'admin'
    ),
    conversation."created_at"
  );
