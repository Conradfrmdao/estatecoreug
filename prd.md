PRD: Property Management System for Rental Income and Expenses
1. Product Overview

Build a modern property management system for a landlord or rental manager to track:

rent payments
who has paid and who has not
payment dates
balances owed
total rent collected
expenses such as renovations, repairs, and maintenance
house/unit status

The system should help the owner understand income, outstanding rent, and spending in one dashboard.

2. Goal

The goal is to make it easy for a landlord to manage rental money and property expenses without using notebooks or spreadsheets.

3. Target User

Primary user:

Property owner / landlord

Possible future users:

admin
accountant
tenant portal user
4. Tech Stack
Frontend: Next.js
Authentication: Clerk
Database: Neon PostgreSQL
ORM: Drizzle ORM
Styling: Tailwind CSS
Optional UI components: shadcn/ui
5. Core Features
A. Authentication
Sign in / sign up with Clerk
Protect all dashboard pages
Only authenticated users can access data
B. Properties / Houses

Store properties and rental units with:

property name
location
number of units
unit number
monthly rent amount
status: occupied / vacant
C. Tenants

Store tenant details:

full name
phone number
email optional
unit rented
move-in date
rent due date
active / inactive status
D. Rent Payments

Track every payment:

tenant name
unit
amount paid
balance remaining
date paid
payment month
payment method
notes

The system should automatically calculate:

total paid by tenant
remaining balance
whether the tenant has fully paid or not
E. Payment Summary

Show:

how many tenants have paid
how many have not paid
total rent collected
total expected rent
total outstanding balance
F. Expenses

Track expenses such as:

renovations
repairs
cleaning
plumbing
electricity
other costs

Each expense should store:

title
category
amount
date
description
property/unit linked to it
G. Dashboard

The dashboard should show cards for:

total properties
total units
occupied units
vacant units
total rent collected
total outstanding rent
total expenses
net profit
H. Search and Filters

Allow filtering by:

property
unit
tenant
payment month
payment status
expense category
I. Reports

Generate simple reports:

monthly rent report
unpaid tenants report
income vs expense report
property summary report
6. Database Entities
User
id
clerkId
name
email
createdAt
Property
id
userId
name
location
createdAt
Unit
id
propertyId
unitNumber
rentAmount
status
createdAt
Tenant
id
unitId
fullName
phone
email
moveInDate
rentDueDate
active
createdAt
RentPayment
id
tenantId
unitId
amountPaid
balanceAfterPayment
paymentMonth
paymentDate
paymentMethod
notes
createdAt
Expense
id
propertyId
unitId optional
title
category
amount
expenseDate
description
createdAt
7. Pages Needed
Public
Landing page
Login / sign up page
Protected App Pages
Dashboard
Properties page
Units page
Tenants page
Rent payments page
Expenses page
Reports page
Settings page
8. User Stories
As a landlord, I want to see who has paid rent this month.
As a landlord, I want to see who still owes money.
As a landlord, I want to record rent payments quickly.
As a landlord, I want to track renovation and repair expenses.
As a landlord, I want a dashboard that shows income and expenses clearly.
As a landlord, I want to search by tenant or house easily.
9. Business Rules
Each tenant belongs to one unit.
Each unit belongs to one property.
Rent payments must be linked to a tenant and unit.
Expenses must be linked to a property, and optionally to a unit.
The system must calculate balances automatically.
A tenant can have multiple payments over time.
A unit can be vacant or occupied.
10. Calculations

The app should calculate:

Total collected = sum of all rent payments
Total expected = sum of all monthly rent amounts for active occupied units
Total outstanding = total expected - total collected
Paid tenants count = number of tenants with full payment for selected month
Unpaid tenants count = number of tenants with unpaid or partial rent
11. UI Requirements
Clean, modern admin dashboard
Mobile responsive
Easy to use on phone and laptop
Tables with search and filters
Summary cards at the top
Charts for income and expenses if possible
Use simple, professional styling
12. MVP Scope

The first version should include:

authentication
properties
units
tenants
rent payments
expenses
dashboard summaries
search and filters
13. Future Features
tenant portal
SMS reminders for overdue rent
PDF receipts
export to Excel or CSV
recurring rent tracking
notifications
multi-user roles
14. Acceptance Criteria

The app is successful when:

the landlord can log in securely
rent payments can be recorded
the system shows who paid and who has not
balances are calculated correctly
expenses can be stored and reviewed
totals appear correctly on the dashboard