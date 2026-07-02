ALTER TABLE rent_payments ADD COLUMN IF NOT EXISTS allocations jsonb;

CREATE INDEX IF NOT EXISTS rent_payments_allocations_gin_idx
  ON rent_payments USING gin (allocations);
