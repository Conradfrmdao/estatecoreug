import type { Config } from 'drizzle-kit'

const cfg: Config = {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ''
  }
}

export default cfg
