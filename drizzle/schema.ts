import { relations, sql } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

export type RentPaymentAllocation = {
  month: string
  amount: number
  rentAmount: number
  balanceAfterAllocation: number
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 50 }).default('landlord').notNull(),
  accountStatus: varchar('account_status', { length: 50 }).default('pending').notNull(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  suspendedAt: timestamp('suspended_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  location: text('location').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  unitNumber: varchar('unit_number', { length: 50 }).notNull(),
  rentAmount: integer('rent_amount').notNull(),
  status: varchar('status', { length: 50 }).default('vacant').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  unitId: integer('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }),
  moveInDate: timestamp('move_in_date', { withTimezone: true }).notNull(),
  rentDueDate: timestamp('rent_due_date', { withTimezone: true }).notNull(),
  paymentTiming: varchar('payment_timing', { length: 50 }).default('advance').notNull(),
  billingCycleMonths: integer('billing_cycle_months').default(1).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  uniqueIndex('tenants_one_active_per_unit_idx')
    .on(table.unitId)
    .where(sql`${table.active} = true`)
])

export const rentPayments = pgTable('rent_payments', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  unitId: integer('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  amountPaid: integer('amount_paid').notNull(),
  balanceAfterPayment: integer('balance_after_payment').notNull(),
  paymentMonth: varchar('payment_month', { length: 50 }).notNull(),
  coverageStart: timestamp('coverage_start', { withTimezone: true }).notNull(),
  coverageEnd: timestamp('coverage_end', { withTimezone: true }).notNull(),
  monthsCovered: integer('months_covered').default(1).notNull(),
  allocations: jsonb('allocations').$type<RentPaymentAllocation[]>(),
  paymentDate: timestamp('payment_date', { withTimezone: true }).defaultNow().notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  unitId: integer('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  amount: integer('amount').notNull(),
  expenseDate: timestamp('expense_date', { withTimezone: true }).defaultNow().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const supportConversations = pgTable('support_conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  adminId: integer('admin_id').references(() => users.id, { onDelete: 'set null' }),
  subject: varchar('subject', { length: 255 }).default('Support request').notNull(),
  status: varchar('status', { length: 50 }).default('open').notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).defaultNow().notNull(),
  landlordReadAt: timestamp('landlord_read_at', { withTimezone: true }),
  adminReadAt: timestamp('admin_read_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const supportMessages = pgTable('support_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => supportConversations.id, { onDelete: 'cascade' }),
  senderUserId: integer('sender_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  senderRole: varchar('sender_role', { length: 50 }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties)
}))

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id]
  }),
  units: many(units),
  expenses: many(expenses)
}))

export const unitsRelations = relations(units, ({ one, many }) => ({
  property: one(properties, {
    fields: [units.propertyId],
    references: [properties.id]
  }),
  tenants: many(tenants),
  rentPayments: many(rentPayments),
  expenses: many(expenses)
}))

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  unit: one(units, {
    fields: [tenants.unitId],
    references: [units.id]
  }),
  rentPayments: many(rentPayments)
}))

export const rentPaymentsRelations = relations(rentPayments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rentPayments.tenantId],
    references: [tenants.id]
  }),
  unit: one(units, {
    fields: [rentPayments.unitId],
    references: [units.id]
  })
}))

export const expensesRelations = relations(expenses, ({ one }) => ({
  property: one(properties, {
    fields: [expenses.propertyId],
    references: [properties.id]
  }),
  unit: one(units, {
    fields: [expenses.unitId],
    references: [units.id]
  })
}))

export const supportConversationsRelations = relations(supportConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [supportConversations.userId],
    references: [users.id],
    relationName: 'supportConversationUser'
  }),
  admin: one(users, {
    fields: [supportConversations.adminId],
    references: [users.id],
    relationName: 'supportConversationAdmin'
  }),
  messages: many(supportMessages)
}))

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  conversation: one(supportConversations, {
    fields: [supportMessages.conversationId],
    references: [supportConversations.id]
  }),
  sender: one(users, {
    fields: [supportMessages.senderUserId],
    references: [users.id]
  })
}))

export type User = typeof users.$inferSelect
export type Property = typeof properties.$inferSelect
export type Unit = typeof units.$inferSelect
export type Tenant = typeof tenants.$inferSelect
export type RentPayment = typeof rentPayments.$inferSelect
export type Expense = typeof expenses.$inferSelect
export type SupportConversation = typeof supportConversations.$inferSelect
export type SupportMessage = typeof supportMessages.$inferSelect
