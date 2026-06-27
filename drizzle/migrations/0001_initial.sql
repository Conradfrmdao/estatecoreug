-- Initial schema migration generated from drizzle/schema.ts

CREATE TABLE users (
  id serial PRIMARY KEY,
  clerk_id varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE properties (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id),
  name varchar(255) NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE units (
  id serial PRIMARY KEY,
  property_id integer NOT NULL REFERENCES properties(id),
  unit_number varchar(50) NOT NULL,
  rent_amount integer NOT NULL,
  status varchar(50) DEFAULT 'vacant' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE tenants (
  id serial PRIMARY KEY,
  unit_id integer NOT NULL REFERENCES units(id),
  full_name varchar(255) NOT NULL,
  phone varchar(50) NOT NULL,
  email varchar(255),
  move_in_date timestamptz NOT NULL,
  rent_due_date timestamptz NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE rent_payments (
  id serial PRIMARY KEY,
  tenant_id integer NOT NULL REFERENCES tenants(id),
  unit_id integer NOT NULL REFERENCES units(id),
  amount_paid integer NOT NULL,
  balance_after_payment integer NOT NULL,
  payment_month varchar(50) NOT NULL,
  payment_date timestamptz DEFAULT now() NOT NULL,
  payment_method varchar(100) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE expenses (
  id serial PRIMARY KEY,
  property_id integer NOT NULL REFERENCES properties(id),
  unit_id integer REFERENCES units(id),
  title varchar(255) NOT NULL,
  category varchar(100) NOT NULL,
  amount integer NOT NULL,
  expense_date timestamptz DEFAULT now() NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);
