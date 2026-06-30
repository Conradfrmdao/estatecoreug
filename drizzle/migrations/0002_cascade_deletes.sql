ALTER TABLE rent_payments DROP CONSTRAINT IF EXISTS rent_payments_tenant_id_tenants_id_fk;
ALTER TABLE rent_payments DROP CONSTRAINT IF EXISTS rent_payments_tenant_id_fkey;
ALTER TABLE rent_payments DROP CONSTRAINT IF EXISTS rent_payments_unit_id_units_id_fk;
ALTER TABLE rent_payments DROP CONSTRAINT IF EXISTS rent_payments_unit_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_property_id_properties_id_fk;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_property_id_fkey;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_unit_id_units_id_fk;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_unit_id_fkey;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_unit_id_units_id_fk;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_unit_id_fkey;
ALTER TABLE units DROP CONSTRAINT IF EXISTS units_property_id_properties_id_fk;
ALTER TABLE units DROP CONSTRAINT IF EXISTS units_property_id_fkey;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_user_id_users_id_fk;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_user_id_fkey;

ALTER TABLE properties
  ADD CONSTRAINT properties_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE units
  ADD CONSTRAINT units_property_id_properties_id_fk
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE tenants
  ADD CONSTRAINT tenants_unit_id_units_id_fk
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

ALTER TABLE rent_payments
  ADD CONSTRAINT rent_payments_tenant_id_tenants_id_fk
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE rent_payments
  ADD CONSTRAINT rent_payments_unit_id_units_id_fk
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

ALTER TABLE expenses
  ADD CONSTRAINT expenses_property_id_properties_id_fk
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE expenses
  ADD CONSTRAINT expenses_unit_id_units_id_fk
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);
CREATE INDEX IF NOT EXISTS units_property_id_idx ON units(property_id);
CREATE INDEX IF NOT EXISTS tenants_unit_id_idx ON tenants(unit_id);
CREATE UNIQUE INDEX IF NOT EXISTS tenants_one_active_per_unit_idx ON tenants(unit_id) WHERE active;
CREATE INDEX IF NOT EXISTS rent_payments_tenant_month_idx ON rent_payments(tenant_id, payment_month);
CREATE INDEX IF NOT EXISTS rent_payments_unit_id_idx ON rent_payments(unit_id);
CREATE INDEX IF NOT EXISTS expenses_property_date_idx ON expenses(property_id, expense_date);
