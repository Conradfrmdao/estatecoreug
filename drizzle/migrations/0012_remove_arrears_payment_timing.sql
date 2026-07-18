UPDATE tenants
SET
  payment_timing = 'advance',
  billing_cycle_months = 1
WHERE payment_timing = 'arrears';
