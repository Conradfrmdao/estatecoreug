ALTER TABLE users ADD COLUMN IF NOT EXISTS phone varchar(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(50) DEFAULT 'landlord' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status varchar(50) DEFAULT 'approved' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

UPDATE users
SET account_status = COALESCE(account_status, 'approved'),
    approved_at = COALESCE(approved_at, created_at),
    last_seen_at = COALESCE(last_seen_at, created_at);

ALTER TABLE users ALTER COLUMN account_status SET DEFAULT 'pending';

ALTER TABLE rent_payments ADD COLUMN IF NOT EXISTS coverage_start timestamptz;
ALTER TABLE rent_payments ADD COLUMN IF NOT EXISTS coverage_end timestamptz;
ALTER TABLE rent_payments ADD COLUMN IF NOT EXISTS months_covered integer DEFAULT 1 NOT NULL;

UPDATE rent_payments
SET coverage_start = COALESCE(
      coverage_start,
      to_timestamp(payment_month || '-01', 'YYYY-MM-DD') AT TIME ZONE 'UTC'
    ),
    coverage_end = COALESCE(
      coverage_end,
      (to_timestamp(payment_month || '-01', 'YYYY-MM-DD') AT TIME ZONE 'UTC') + interval '1 month'
    ),
    months_covered = COALESCE(NULLIF(months_covered, 0), 1);

ALTER TABLE rent_payments ALTER COLUMN coverage_start SET NOT NULL;
ALTER TABLE rent_payments ALTER COLUMN coverage_end SET NOT NULL;

CREATE INDEX IF NOT EXISTS users_account_status_idx ON users(account_status);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS rent_payments_coverage_idx ON rent_payments(tenant_id, coverage_start, coverage_end);
