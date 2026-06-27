module.exports = {

"[project]/drizzle/schema.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "expenses": ()=>expenses,
    "expensesRelations": ()=>expensesRelations,
    "properties": ()=>properties,
    "propertiesRelations": ()=>propertiesRelations,
    "rentPayments": ()=>rentPayments,
    "rentPaymentsRelations": ()=>rentPaymentsRelations,
    "tenants": ()=>tenants,
    "tenantsRelations": ()=>tenantsRelations,
    "units": ()=>units,
    "unitsRelations": ()=>unitsRelations,
    "users": ()=>users,
    "usersRelations": ()=>usersRelations
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$relations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/relations.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/pg-core/columns/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/pg-core/columns/integer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/pg-core/columns/serial.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/pg-core/columns/varchar.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
const users = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('users', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])('id').primaryKey(),
    clerkId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('clerk_id', {
        length: 255
    }).notNull().unique(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('name', {
        length: 255
    }).notNull(),
    email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('email', {
        length: 255
    }).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at', {
        withTimezone: true
    }).defaultNow().notNull()
});
const properties = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('properties', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])('id').primaryKey(),
    userId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('user_id').notNull().references(()=>users.id),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('name', {
        length: 255
    }).notNull(),
    location: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('location').notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at', {
        withTimezone: true
    }).defaultNow().notNull()
});
const units = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('units', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])('id').primaryKey(),
    propertyId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('property_id').notNull().references(()=>properties.id),
    unitNumber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('unit_number', {
        length: 50
    }).notNull(),
    rentAmount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('rent_amount').notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('status', {
        length: 50
    }).default('vacant').notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at', {
        withTimezone: true
    }).defaultNow().notNull()
});
const tenants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('tenants', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])('id').primaryKey(),
    unitId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('unit_id').notNull().references(()=>units.id),
    fullName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('full_name', {
        length: 255
    }).notNull(),
    phone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('phone', {
        length: 50
    }).notNull(),
    email: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('email', {
        length: 255
    }),
    moveInDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('move_in_date', {
        withTimezone: true
    }).notNull(),
    rentDueDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('rent_due_date', {
        withTimezone: true
    }).notNull(),
    active: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])('active').default(true).notNull(),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at', {
        withTimezone: true
    }).defaultNow().notNull()
});
const rentPayments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('rent_payments', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])('id').primaryKey(),
    tenantId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('tenant_id').notNull().references(()=>tenants.id),
    unitId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('unit_id').notNull().references(()=>units.id),
    amountPaid: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('amount_paid').notNull(),
    balanceAfterPayment: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('balance_after_payment').notNull(),
    paymentMonth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('payment_month', {
        length: 50
    }).notNull(),
    paymentDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('payment_date', {
        withTimezone: true
    }).defaultNow().notNull(),
    paymentMethod: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('payment_method', {
        length: 100
    }).notNull(),
    notes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('notes'),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at', {
        withTimezone: true
    }).defaultNow().notNull()
});
const expenses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])('expenses', {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$serial$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serial"])('id').primaryKey(),
    propertyId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('property_id').notNull().references(()=>properties.id),
    unitId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('unit_id').references(()=>units.id),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('title', {
        length: 255
    }).notNull(),
    category: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$varchar$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["varchar"])('category', {
        length: 100
    }).notNull(),
    amount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])('amount').notNull(),
    expenseDate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('expense_date', {
        withTimezone: true
    }).defaultNow().notNull(),
    description: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])('description'),
    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])('created_at', {
        withTimezone: true
    }).defaultNow().notNull()
});
const usersRelations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$relations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relations"])(users, ({ many })=>({
        properties: many(properties)
    }));
const propertiesRelations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$relations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relations"])(properties, ({ one, many })=>({
        user: one(users, {
            fields: [
                properties.userId
            ],
            references: [
                users.id
            ]
        }),
        units: many(units),
        expenses: many(expenses)
    }));
const unitsRelations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$relations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relations"])(units, ({ one, many })=>({
        property: one(properties, {
            fields: [
                units.propertyId
            ],
            references: [
                properties.id
            ]
        }),
        tenants: many(tenants),
        rentPayments: many(rentPayments),
        expenses: many(expenses)
    }));
const tenantsRelations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$relations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relations"])(tenants, ({ one, many })=>({
        unit: one(units, {
            fields: [
                tenants.unitId
            ],
            references: [
                units.id
            ]
        }),
        rentPayments: many(rentPayments)
    }));
const rentPaymentsRelations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$relations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relations"])(rentPayments, ({ one })=>({
        tenant: one(tenants, {
            fields: [
                rentPayments.tenantId
            ],
            references: [
                tenants.id
            ]
        }),
        unit: one(units, {
            fields: [
                rentPayments.unitId
            ],
            references: [
                units.id
            ]
        })
    }));
const expensesRelations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$relations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["relations"])(expenses, ({ one })=>({
        property: one(properties, {
            fields: [
                expenses.propertyId
            ],
            references: [
                properties.id
            ]
        }),
        unit: one(units, {
            fields: [
                expenses.unitId
            ],
            references: [
                units.id
            ]
        })
    }));

})()),
"[project]/lib/db.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "db": ()=>db
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/neon-http/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/drizzle/schema.ts [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
const sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(process.env.DATABASE_URL);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$neon$2d$http$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(sql, {
    schema: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
});

})()),
"[project]/lib/auth.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "getCurrentAppUser": ()=>getCurrentAppUser,
    "getCurrentUser": ()=>getCurrentUser,
    "requireCurrentAppUser": ()=>requireCurrentAppUser
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$app$2d$router$2f$server$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@clerk/nextjs/dist/esm/app-router/server/auth.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$app$2d$router$2f$server$2f$currentUser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@clerk/nextjs/dist/esm/app-router/server/currentUser.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/drizzle/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/next/dist/api/navigation.react-server.js [app-route] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
;
;
async function getCurrentUser() {
    // Clerk v5 uses auth() as a function — works in both v4 and v5
    const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$app$2d$router$2f$server$2f$auth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["auth"])();
    const userId = authResult?.userId;
    if (!userId) throw new Error('Unauthenticated');
    let user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].query.users.findFirst({
        where: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"].clerkId, userId)
    });
    if (!user) {
        const clerkUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$app$2d$router$2f$server$2f$currentUser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentUser"])();
        if (!clerkUser) throw new Error('User not found in database or Clerk');
        const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUser.id}@clerk.local`;
        const name = clerkUser.fullName ?? clerkUser.username ?? clerkUser.firstName ?? email;
        const [created] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["users"]).values({
            clerkId: clerkUser.id,
            email,
            name
        }).returning();
        user = created;
    }
    return user;
}
async function getCurrentAppUser() {
    try {
        return await getCurrentUser();
    } catch  {
        return null;
    }
}
async function requireCurrentAppUser() {
    const user = await getCurrentAppUser();
    if (!user) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])('/sign-in');
    }
    return user;
}

})()),
"[project]/lib/format.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "currency": ()=>currency,
    "currentPaymentMonth": ()=>currentPaymentMonth,
    "formatDate": ()=>formatDate,
    "monthLabel": ()=>monthLabel,
    "toDateInputValue": ()=>toDateInputValue
});
function currency(value) {
    return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        maximumFractionDigits: 0
    }).format(value);
}
function formatDate(value) {
    if (!value) {
        return '-';
    }
    return new Intl.DateTimeFormat('en-UG', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(value));
}
function currentPaymentMonth(date = new Date()) {
    return date.toISOString().slice(0, 7);
}
function monthLabel(month) {
    if (!month) {
        return 'All months';
    }
    const [year, monthNumber] = month.split('-').map(Number);
    if (!year || !monthNumber) {
        return month;
    }
    return new Intl.DateTimeFormat('en-UG', {
        month: 'long',
        year: 'numeric'
    }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}
function toDateInputValue(value) {
    if (!value) {
        return '';
    }
    return new Date(value).toISOString().slice(0, 10);
}

})()),
"[project]/lib/data.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "calculateBalanceAfterPayment": ()=>calculateBalanceAfterPayment,
    "getDashboardData": ()=>getDashboardData,
    "getExpenseForUser": ()=>getExpenseForUser,
    "getPaymentForUser": ()=>getPaymentForUser,
    "getPropertyForUser": ()=>getPropertyForUser,
    "getTenantForUser": ()=>getTenantForUser,
    "getUnitForUser": ()=>getUnitForUser,
    "listExpensesForUser": ()=>listExpensesForUser,
    "listPaymentsForUser": ()=>listPaymentsForUser,
    "listPropertiesForUser": ()=>listPropertiesForUser,
    "listTenantBalances": ()=>listTenantBalances,
    "listTenantsForUser": ()=>listTenantsForUser,
    "listUnitsForUser": ()=>listUnitsForUser
});
var __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/drizzle/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/lib/format.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
;
function sum(values) {
    return values.reduce((total, value)=>total + value, 0);
}
function getExpenseMonth(expense) {
    return expense.expenseDate.toISOString().slice(0, 7);
}
async function listPropertiesForUser(userId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].createdAt));
}
async function listUnitsForUser(userId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].propertyId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].createdAt));
}
async function listTenantsForUser(userId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        tenant: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"],
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].unitId)).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].propertyId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].createdAt));
}
async function listPaymentsForUser(userId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        payment: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"],
        tenant: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"],
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"].tenantId)).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"].unitId)).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].propertyId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"].paymentDate));
}
async function listExpensesForUser(userId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        expense: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"],
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"].propertyId)).leftJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"].unitId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"].expenseDate));
}
async function getPropertyForUser(userId, propertyId) {
    const [row] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, propertyId))).limit(1);
    return row ?? null;
}
async function getUnitForUser(userId, unitId) {
    const [row] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].propertyId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].id, unitId))).limit(1);
    return row ?? null;
}
async function getTenantForUser(userId, tenantId) {
    const [row] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        tenant: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"],
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].unitId)).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].propertyId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].id, tenantId))).limit(1);
    return row ?? null;
}
async function getPaymentForUser(userId, paymentId) {
    const [row] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        payment: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"],
        tenant: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"],
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tenants"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"].tenantId)).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"].unitId)).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].propertyId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rentPayments"].id, paymentId))).limit(1);
    return row ?? null;
}
async function getExpenseForUser(userId, expenseId) {
    const [row] = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        expense: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"],
        property: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"],
        unit: __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"].propertyId)).leftJoin(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["units"].id, __TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"].unitId)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["properties"].userId, userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$drizzle$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expenses"].id, expenseId))).limit(1);
    return row ?? null;
}
async function listTenantBalances(userId, month = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentPaymentMonth"])()) {
    const tenantRows = await listTenantsForUser(userId);
    const paymentRows = await listPaymentsForUser(userId);
    const activeTenants = tenantRows.filter(({ tenant })=>tenant.active);
    const paidByTenant = new Map();
    for (const { payment } of paymentRows){
        if (payment.paymentMonth !== month) {
            continue;
        }
        paidByTenant.set(payment.tenantId, (paidByTenant.get(payment.tenantId) ?? 0) + payment.amountPaid);
    }
    return activeTenants.map((row)=>{
        const amountPaid = paidByTenant.get(row.tenant.id) ?? 0;
        const balance = Math.max(row.unit.rentAmount - amountPaid, 0);
        const paymentStatus = balance <= 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid';
        return {
            ...row,
            amountPaid,
            balance,
            paymentStatus
        };
    });
}
async function calculateBalanceAfterPayment(params) {
    const tenantRow = await getTenantForUser(params.userId, params.tenantId);
    if (!tenantRow) {
        return null;
    }
    const paymentRows = await listPaymentsForUser(params.userId);
    const alreadyPaid = sum(paymentRows.filter(({ payment })=>{
        if (payment.tenantId !== params.tenantId) {
            return false;
        }
        if (payment.paymentMonth !== params.paymentMonth) {
            return false;
        }
        return payment.id !== params.ignorePaymentId;
    }).map(({ payment })=>payment.amountPaid));
    return {
        unitId: tenantRow.unit.id,
        balanceAfterPayment: Math.max(tenantRow.unit.rentAmount - alreadyPaid - params.amountPaid, 0)
    };
}
async function getDashboardData(userId, month = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$format$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["currentPaymentMonth"])()) {
    const [propertyRows, unitRows, tenantRows, paymentRows, expenseRows, tenantBalances] = await Promise.all([
        listPropertiesForUser(userId),
        listUnitsForUser(userId),
        listTenantsForUser(userId),
        listPaymentsForUser(userId),
        listExpensesForUser(userId),
        listTenantBalances(userId, month)
    ]);
    const monthlyPayments = paymentRows.filter(({ payment })=>payment.paymentMonth === month);
    const monthlyExpenses = expenseRows.filter(({ expense })=>getExpenseMonth(expense) === month);
    const activeTenants = tenantRows.filter(({ tenant })=>tenant.active);
    const totalExpected = sum(tenantBalances.map(({ unit })=>unit.rentAmount));
    const totalCollected = sum(paymentRows.map(({ payment })=>payment.amountPaid));
    const collectedThisMonth = sum(monthlyPayments.map(({ payment })=>payment.amountPaid));
    const totalExpenses = sum(expenseRows.map(({ expense })=>expense.amount));
    const expensesThisMonth = sum(monthlyExpenses.map(({ expense })=>expense.amount));
    const totalOutstanding = sum(tenantBalances.map(({ balance })=>balance));
    return {
        month,
        summary: {
            totalProperties: propertyRows.length,
            totalUnits: unitRows.length,
            occupiedUnits: unitRows.filter(({ unit })=>unit.status === 'occupied').length,
            vacantUnits: unitRows.filter(({ unit })=>unit.status === 'vacant').length,
            activeTenants: activeTenants.length,
            paidTenants: tenantBalances.filter(({ paymentStatus })=>paymentStatus === 'paid').length,
            unpaidTenants: tenantBalances.filter(({ paymentStatus })=>paymentStatus !== 'paid').length,
            totalExpected,
            totalCollected,
            collectedThisMonth,
            totalOutstanding,
            totalExpenses,
            expensesThisMonth,
            netProfit: totalCollected - totalExpenses,
            netThisMonth: collectedThisMonth - expensesThisMonth
        },
        properties: propertyRows,
        units: unitRows,
        tenants: tenantRows,
        payments: paymentRows,
        expenses: expenseRows,
        tenantBalances,
        recentPayments: paymentRows.slice(0, 5),
        recentExpenses: expenseRows.slice(0, 5)
    };
}

})()),
"[project]/lib/pdf/receipt.tsx [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, a: __turbopack_async_module__, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_esm__({
    "ReceiptDocument": ()=>ReceiptDocument
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/future/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-route] (ecmascript)");
var __TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__ = __turbopack_external_import__("@react-pdf/renderer");
var __TURBOPACK__commonjs__external__path__ = __turbopack_external_require__("path", true);
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__
]);
[__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
const styles = __TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["StyleSheet"].create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155',
        backgroundColor: '#ffffff'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#166534',
        paddingBottom: 15,
        marginBottom: 20
    },
    logo: {
        width: 120,
        height: 40,
        objectFit: 'contain'
    },
    titleContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 2
    },
    subtitle: {
        fontSize: 8,
        color: '#d97706',
        letterSpacing: 1
    },
    metaSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    metaCol: {
        flexDirection: 'column'
    },
    metaLabel: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 3,
        textTransform: 'uppercase'
    },
    metaValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f172a'
    },
    detailsTable: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 25
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 10,
        alignItems: 'center'
    },
    tableHeader: {
        backgroundColor: '#f0fdf4',
        borderBottomWidth: 2,
        borderBottomColor: '#166534'
    },
    th: {
        fontWeight: 'bold',
        color: '#166534'
    },
    col1: {
        width: '40%'
    },
    col2: {
        width: '20%',
        textAlign: 'center'
    },
    col3: {
        width: '20%',
        textAlign: 'right'
    },
    col4: {
        width: '20%',
        textAlign: 'right'
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 40
    },
    totalTable: {
        width: '40%',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 6,
        overflow: 'hidden'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    grandTotalRow: {
        backgroundColor: '#166534',
        color: '#ffffff'
    },
    grandTotalText: {
        fontWeight: 'bold',
        color: '#ffffff'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8'
    }
});
function ReceiptDocument({ payment }) {
    const logoPath = __TURBOPACK__commonjs__external__path__["default"].join(process.cwd(), 'public/estatecoreuglogo.png');
    const dateStr = new Date(payment.paymentDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    const formatUGX = (amount)=>{
        return `UGX ${amount.toLocaleString('en-US')}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Document"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Page"], {
            size: "A4",
            style: styles.page,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                    style: styles.header,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Image"], {
                            src: logoPath,
                            style: styles.logo
                        }, void 0, false, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                            style: styles.titleContainer,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.title,
                                    children: "RENT RECEIPT"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 167,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.subtitle,
                                    children: "PROPERTY MANAGEMENT SOLUTIONS"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 168,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 166,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/lib/pdf/receipt.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                    style: styles.metaSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                            style: styles.metaCol,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaLabel,
                                    children: "Receipt Number"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 175,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaValue,
                                    children: [
                                        "EC-PAY-",
                                        payment.id.toString().padStart(5, '0')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 174,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                            style: styles.metaCol,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaLabel,
                                    children: "Payment Date"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 179,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaValue,
                                    children: dateStr
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 180,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 178,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                            style: styles.metaCol,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaLabel,
                                    children: "Payment Method"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaValue,
                                    children: payment.paymentMethod.toUpperCase()
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 184,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 182,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                            style: styles.metaCol,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaLabel,
                                    children: "Month Covered"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 187,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.metaValue,
                                    children: payment.paymentMonth
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 188,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 186,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/lib/pdf/receipt.tsx",
                    lineNumber: 173,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                    style: styles.detailsTable,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                            style: [
                                styles.tableRow,
                                styles.tableHeader
                            ],
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: [
                                        styles.col1,
                                        styles.th
                                    ],
                                    children: "Property & Unit"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 196,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: [
                                        styles.col2,
                                        styles.th
                                    ],
                                    children: "Tenant Name"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 197,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: [
                                        styles.col3,
                                        styles.th
                                    ],
                                    children: "Monthly Rent"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 198,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: [
                                        styles.col4,
                                        styles.th
                                    ],
                                    children: "Amount Paid"
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 199,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 195,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                            style: styles.tableRow,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.col1,
                                    children: [
                                        payment.propertyName,
                                        " - Unit ",
                                        payment.unitNumber
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 204,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.col2,
                                    children: payment.tenantName
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 205,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.col3,
                                    children: formatUGX(payment.rentAmount)
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 206,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                    style: styles.col4,
                                    children: formatUGX(payment.amountPaid)
                                }, void 0, false, {
                                    fileName: "[project]/lib/pdf/receipt.tsx",
                                    lineNumber: 207,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/lib/pdf/receipt.tsx",
                    lineNumber: 193,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                    style: styles.totalSection,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                        style: styles.totalTable,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                                style: styles.totalRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                        style: {
                                            fontSize: 9
                                        },
                                        children: "Rent Due:"
                                    }, void 0, false, {
                                        fileName: "[project]/lib/pdf/receipt.tsx",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                        style: {
                                            fontSize: 9
                                        },
                                        children: formatUGX(payment.rentAmount)
                                    }, void 0, false, {
                                        fileName: "[project]/lib/pdf/receipt.tsx",
                                        lineNumber: 216,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/lib/pdf/receipt.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                                style: styles.totalRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                        style: {
                                            fontSize: 9
                                        },
                                        children: "Total Paid:"
                                    }, void 0, false, {
                                        fileName: "[project]/lib/pdf/receipt.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                        style: {
                                            fontSize: 9,
                                            fontWeight: 'bold'
                                        },
                                        children: formatUGX(payment.amountPaid)
                                    }, void 0, false, {
                                        fileName: "[project]/lib/pdf/receipt.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/lib/pdf/receipt.tsx",
                                lineNumber: 218,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                                style: [
                                    styles.totalRow,
                                    styles.grandTotalRow
                                ],
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                        style: [
                                            styles.grandTotalText,
                                            {
                                                fontSize: 9
                                            }
                                        ],
                                        children: "Balance:"
                                    }, void 0, false, {
                                        fileName: "[project]/lib/pdf/receipt.tsx",
                                        lineNumber: 223,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                                        style: [
                                            styles.grandTotalText,
                                            {
                                                fontSize: 9
                                            }
                                        ],
                                        children: formatUGX(payment.balanceAfterPayment)
                                    }, void 0, false, {
                                        fileName: "[project]/lib/pdf/receipt.tsx",
                                        lineNumber: 224,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/lib/pdf/receipt.tsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/lib/pdf/receipt.tsx",
                        lineNumber: 213,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/lib/pdf/receipt.tsx",
                    lineNumber: 212,
                    columnNumber: 9
                }, this),
                payment.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["View"], {
                    style: {
                        marginTop: 10,
                        padding: 10,
                        backgroundColor: '#f8fafc',
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#e2e8f0'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                            style: {
                                fontSize: 8,
                                color: '#64748b',
                                textTransform: 'uppercase',
                                marginBottom: 2
                            },
                            children: "Notes"
                        }, void 0, false, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 231,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                            style: {
                                fontSize: 9,
                                color: '#334155'
                            },
                            children: payment.notes
                        }, void 0, false, {
                            fileName: "[project]/lib/pdf/receipt.tsx",
                            lineNumber: 232,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/lib/pdf/receipt.tsx",
                    lineNumber: 230,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__esm__external__$40$react$2d$pdf$2f$renderer__["Text"], {
                    style: styles.footer,
                    children: [
                        "Thank you for your payment. Generated by EstateCore UG on ",
                        new Date().toLocaleDateString()
                    ]
                }, void 0, true, {
                    fileName: "[project]/lib/pdf/receipt.tsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/lib/pdf/receipt.tsx",
            lineNumber: 162,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/lib/pdf/receipt.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);
})()),
"[project]/app/api/receipts/[paymentId]/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, a: __turbopack_async_module__, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_esm__({
    "GET": ()=>GET,
    "dynamic": ()=>dynamic
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/lib/data.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pdf$2f$receipt$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/lib/pdf/receipt.tsx [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/future/route-modules/app-page/vendored/rsc/react.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pdf$2f$receipt$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pdf$2f$receipt$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToStream } = __turbopack_require__("[project]/node_modules/@react-pdf/renderer/lib/react-pdf.js [app-route] (ecmascript) <facade>");
;
;
const dynamic = 'force-dynamic';
async function GET(_req, { params }) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireCurrentAppUser"])();
        const paymentId = Number(params.paymentId);
        if (!paymentId || Number.isNaN(paymentId)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid payment ID.'
            }, {
                status: 400
            });
        }
        const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPaymentForUser"])(user.id, paymentId);
        if (!row) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Payment not found or unauthorized.'
            }, {
                status: 404
            });
        }
        const paymentData = {
            id: row.payment.id,
            amountPaid: row.payment.amountPaid,
            balanceAfterPayment: row.payment.balanceAfterPayment,
            paymentMonth: row.payment.paymentMonth,
            paymentDate: row.payment.paymentDate,
            paymentMethod: row.payment.paymentMethod,
            notes: row.payment.notes,
            tenantName: row.tenant.fullName,
            unitNumber: row.unit.unitNumber,
            propertyName: row.property.name,
            rentAmount: row.unit.rentAmount
        };
        const element = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$future$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$pdf$2f$receipt$2e$tsx__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ReceiptDocument"], {
            payment: paymentData
        });
        const stream = await renderToStream(element);
        const responseStream = new ReadableStream({
            start (controller) {
                stream.on('data', (chunk)=>controller.enqueue(chunk));
                stream.on('end', ()=>controller.close());
                stream.on('error', (err)=>controller.error(err));
            }
        });
        return new Response(responseStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="receipt_${paymentId}.pdf"`
            }
        });
    } catch (error) {
        console.error('Error rendering PDF receipt:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Failed to render PDF.'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);
})()),

};

//# sourceMappingURL=_342092._.js.map