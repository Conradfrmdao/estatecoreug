CREATE UNIQUE INDEX IF NOT EXISTS tenants_one_active_per_unit_idx
ON tenants (unit_id)
WHERE active = true;
