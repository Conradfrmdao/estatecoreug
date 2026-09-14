# Claude Design brief — EstateCore UG

> Paste everything below the line into Claude Design as a single prompt.

---

# Redesign the EstateCore UG front end

You are designing the visual and interaction layer for **EstateCore UG**, a live production property-management web app used by landlords in Uganda. It is already built and in daily use. Your job is **not** to invent a new product — it is to raise the visual and UX quality of the existing product without changing what it does.

Produce a **design canvas with artboards** covering every screen listed below, at both mobile and desktop widths, plus a design-system artboard. The output will be implemented by an engineer in the real codebase, so every decision must be specific, token-named, and buildable in Tailwind CSS v3.

---

## 1. Product context

**What it is:** A single-landlord workspace for managing rental property in Uganda. A landlord signs up, an admin approves the account, then the landlord manages properties → units → tenants → rent payments → expenses, and pulls PDF reports.

**Who uses it:**
- **Landlords** (primary, ~95% of usage). Often not highly technical. Frequently middle-aged. Many manage 1–5 properties with 5–40 units. They check the app on a **phone**, often on mobile data, sometimes in the field while collecting rent in cash.
- **Platform admin** (the app owner). Approves/rejects/suspends landlord accounts, monitors usage, answers support chat.

**Where they are:** Kampala, Uganda. Currency is **UGX** (Ugandan Shilling), formatted by `Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' })`, which renders strings like `UGX 1,250,000`. Timezone `Africa/Kampala`. Locale `en-UG`. English only.

**The mental model the UI must protect:**
- A **property** contains **units**. A unit has a monthly rent amount and is `occupied` or `vacant`.
- A **tenant** occupies exactly one unit and has a move-in date, a billing start date, and a rent due date.
- A **rent payment** is money received. It is *allocated* across one or more calendar months, oldest unpaid month first. A payment can cover 1, 3, 6, 12 or a custom number of months.
- Unpaid rent **rolls forward**: if a tenant misses August, September shows the September rent *plus* the August arrears. The UI must make that composition obvious — this is the single most important comprehension problem in the app.
- Landlords can now record payments **in advance**, before rent is due. The UI must make "this tenant is paid up, this payment covers a future month" as clear as "this tenant owes money".

---

## 2. Hard technical constraints — the design must fit these

Do not propose anything that cannot be built inside these:

| Constraint | Detail |
|---|---|
| Framework | Next.js 16 App Router, React 19, server components by default |
| Styling | **Tailwind CSS v3** with a near-empty config (only a `boxShadow.soft` extension). No plugins. No `@tailwindcss/forms`, no `@tailwindcss/typography`. |
| Design tokens | CSS custom properties declared in `app/globals.css` under `:root`. Tailwind arbitrary values (`bg-[#063f35]`) are used freely. |
| Icons | **lucide-react only.** Do not introduce another icon set. Typical usage `className="h-4 w-4" strokeWidth={1.9}`. |
| Fonts | **Inter**, weights 300–900, currently loaded via a `<link>` to Google Fonts in the root layout. You may recommend `next/font` but keep Inter unless you have a strong reason. |
| Component library | **None.** Everything is hand-rolled Tailwind. No shadcn, no Radix, no MUI. Any component you design must be expressible as plain JSX + Tailwind classes. |
| Auth UI | Clerk (`<SignIn>`, `<SignUp>`, `<UserButton>`) — themed via a small `appearance` object, so its internals are only partly controllable. |
| PDF reports | `@react-pdf/renderer` generates downloadable reports. That output is **out of scope** — do not redesign the PDFs. |
| Dark mode | Does **not** exist today. You may propose it, but it must be optional and additive, never a prerequisite for the redesign. |
| Data density | Real accounts have 40+ units and 100+ payments. Designs must survive long lists and long currency strings. |
| No new dependencies | Assume none will be added. Charts, if any, must be CSS/SVG hand-built (there is already a hand-built conic-gradient donut and a CSS bar chart). |

---

## 3. The current design system (exact values — inherit or deliberately replace)

### Color tokens (`app/globals.css`)
```
--brand:              #00A550   /* primary green — "Awiil brand" */
--brand-hover:        #008f44
--brand-dark:         #007038
--brand-light:        #e6f7ef
--brand-foreground:   #ffffff

--background:         #f8fafc
--foreground:         #1a1a2e   /* near-black navy, used for all headings */
--muted:              #64748b
--muted-foreground:   #94a3b8
--border:             #e2e8f0
--input:              #e2e8f0
--ring:               #00A550

--card:               #ffffff
--popover:            #ffffff
--secondary:          #f1f5f9
--accent:             #f0fdf4
--accent-foreground:  #166534
--destructive:        #ef4444
--warn:               #f59e0b
--warn-foreground:    #78350f

--radius:             0.75rem
--shadow-sm:    0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)
--shadow-md:    0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)
--shadow-lg:    0 10px 30px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.06)
--shadow-brand: 0 4px 14px rgba(0,165,80,.25)
```

### Other colors hard-coded around the app (not tokenized — this is part of the problem)
- Dark brand surfaces: `#071a0f` (logo tile, landing page, theme-color), `#063f35` (desktop sidebar), `#087d5f` (active sidebar item), `#032f29` (sidebar overlay), `#74e3a2` (landing eyebrow text).
- Tailwind palette used ad hoc: `emerald-50/600/700`, `slate-50…950`, `amber-50/200/700`, `rose-50/500/600/700`, `red-50/100/500/700`, `orange-50/600`, `blue-50/700`, `sky`, `teal`, `yellow`.

### Typography
- Inter. `body` is `16px` on mobile and **drops to `14px` at ≥640px** (unusual — evaluate this).
- `line-height: 1.6`, antialiased.
- `font-black` (900) is used extremely heavily — for page titles, card values, table cell values, badges, and even 10px labels.
- Common sizes seen: `text-[9.5px]`, `text-[10px]`, `text-[10.5px]`, `text-[11px]`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, plus `clamp()` in two places.

### Existing utility classes (`app/globals.css`)
- `.btn-brand` — green fill, brand shadow, lifts `-1px` on hover.
- `.btn-outline` — transparent, 1.5px border.
- `.card-hover` — lifts `-2px`, swaps to shadow-md.
- `.badge` + `.badge-green` / `.badge-amber` / `.badge-red` / `.badge-slate` — pill, 11px, 600 weight, uppercase, `2px 10px`.
- `.data-table` — full-width table; 13.5px body, 11px uppercase 600 headers on `#f8fafc`, 1px row dividers, hover row tint. **At ≤720px it collapses to stacked cards**: `thead` hides, each `<tr>` becomes a bordered white card, each `<td>` becomes a 2-column grid where `::before` renders `attr(data-label)` as a 10px uppercase label. Every `<td>` in the codebase carries a `data-label`.
- `.field-label` — 13px, 500, `#374151`, 6px bottom margin.
- `.field-input` — full width, 1.5px border, 8px radius, `min-height: 44px`, **16px font on mobile** (prevents iOS zoom) dropping to 14px at ≥640px, green focus ring `0 0 0 3px rgba(0,165,80,.12)`.
- `.form-actions` — stacked full-width buttons on mobile, inline row at ≥640px.
- `.animate-in` — 300ms fade + 8px rise. Applied to nearly every page root.
- `*:focus-visible` — 2px solid brand outline, 2px offset. Global.
- `.app-shell-main` — bottom padding `7rem + safe-area` below 1024px to clear the floating mobile nav.

### Radii and shadow conventions in use
`rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-full`. Cards are almost always `rounded-xl border border-slate-200 bg-white shadow-sm`.

---

## 4. Global layout and navigation

### `AppShell` — wraps every authenticated screen
Full-height flex, `h-screen h-dvh overflow-hidden`, page background `#f8fafb`.

**Desktop (≥1024px):**
- Fixed **264px sidebar**, background `#063f35` with a full-bleed background image (`/estatecore-sidebar-bg.png`) plus two dark gradient overlays, right-edge shadow.
- Sidebar header: 48px dark-tile logo mark + "EstateCore UG" / "PROPERTY MANAGEMENT" eyebrow, white text, bottom hairline `white/10`.
- Nav items: `h-[clamp(2.25rem,5dvh,3rem)]`, `rounded-xl`, 19px icon + 14px semibold label. Active = `bg-[#087d5f]` white text with a drop shadow. Inactive = `text-emerald-50/75`, hover `bg-white/10`.
- Sidebar footer: a "Need help? / Chat with admin" support button (hidden for admins).
- Top bar: white, 1px bottom border. Left = pin icon + "Kampala, Uganda". Right = notification bell, Clerk `UserButton`, user name + role ("Landlord" / "Admin"), chevron.

**Mobile (<1024px):**
- Sticky white/95 backdrop-blurred header: logo mark + "Estate Core UG" over the **current page title**, then support icon, notification bell, `UserButton`, and a hamburger opening a 4-item dropdown.
- **Floating bottom nav**: fixed, `left-2 right-2`, max 430px, centered, `rounded-2xl`, white/95, backdrop-blur, big soft shadow, sits `0.75rem + safe-area` from the bottom. 5 items, horizontally scrollable, icon over a `9.5px` uppercase-ish label. Active item = solid brand green, white text.

**Nav taxonomy:**
- Sidebar (9, +Admin for admins): Dashboard, Properties, Units, Tenants, Payments, Expenses, Calendar, Reports, Settings.
- Mobile bottom bar (5): Dashboard, Properties, Units, Tenants, Payments.
- Mobile hamburger (4): Expenses, Calendar, Reports, Settings.

### Page-header patterns — currently **two competing ones**
- **Pattern A** (Properties, Units, Tenants, Payments, Expenses, Reports): `text-2xl sm:text-3xl font-bold` title in `#1a1a2e`, a muted one-line subtitle, and a full-width-on-mobile green primary action button on the right.
- **Pattern B** (Dashboard, Settings, Admin, Property detail, Calendar): a small colored uppercase **eyebrow** label, then a `text-xl sm:text-3xl font-black tracking-tight` title, then subtitle.

Unify these.

---

## 5. Complete screen inventory

Design **every** screen below. For each, I've given the current structure so you know exactly what exists.

### 5.1 `/` — Public landing page (unauthenticated)
Dark theme (`#071a0f`), completely different visual language from the app.
- Sticky dark nav: logo + wordmark + "PROPERTY MANAGEMENT", then Sign in / Get started (or Dashboard if signed in). Button labels shorten below 380px.
- Hero: full-bleed background photo with three stacked overlays (flat dark, a vertical/horizontal gradient that switches at `sm`, and a green blur wash). Green uppercase eyebrow, `clamp(2.15rem,11vw,3.5rem)` → `clamp(3.4rem,6vw,5.75rem)` black headline "Smart Property Management for Modern Landlords", body paragraph, two CTAs (white solid + translucent outline). Min height `calc(100svh - 7rem)`.
- "Operating system" section on `#f5f7f5`: 4 capability cards (icon, title, description) — Portfolio control, Coverage-aware rent, Rent calendar, Private by account.
- "Workflow" section on white: 2-column, left copy + right list of 4 check-marked steps.
- Closing CTA band: same hero photo + overlays, headline + single white button.
- Footer: dark, brand line + phone `+256 751929535` + email.

### 5.2 `/sign-in` and `/sign-up`
Light `#f8fafc` page, max-width `26rem`, centered. A "Back" pill button, a 44px dark logo tile, "Welcome back" / heading + subtitle, then the Clerk widget styled via an `appearance` object (hidden Clerk header, 40px inputs on mobile → 36px desktop, brand-green primary color, `0.75rem` radius, bordered card with `shadow-sm`).

### 5.3 `/pending-approval`
Shown to landlords whose account is `pending`, `rejected`, or `suspended`. Centered card on `slate-50`, max-width `xl`. 80–96px logo tile, green uppercase eyebrow (copy varies by status), brand name + "PROPERTY MANAGEMENT" eyebrow, large headline, two paragraphs of explanation, a slate info box with the user's name/email and an amber "Status: pending" pill, a support-contact box (phone + email), then "Back to home" + "Sign out" buttons.

### 5.4 `/dashboard` — the most important screen
Currently the **densest** screen in the app and stylistically a world of its own (`space-y-3`, 10–12px type everywhere). It has:
1. **Header row** — "Dashboard" + "Welcome back, {firstName}…", then a "Record Payment" green button and an inline month-picker form (`<input type="month">` + Filter button).
2. **4 KPI cards** (2-col mobile, 4-col at `xl`): Collected This Month, Outstanding Rent, Monthly Expenses, Monthly Net Profit. Each is a `Link`, has a tone (green / amber / blue / dark), a circular icon chip, an 10.5px title, a `clamp`-ish value, a sub-line with an up/down arrow, and — at `2xl` only — a **decorative fake sparkline SVG with hard-coded points**. ⚠️ The sparkline is fabricated data and the arrow direction is hard-coded. Fix or remove.
3. **Portfolio metric strip** — one white card containing 5 link tiles (Properties, Units, Occupied, Vacant, Tenants), each an icon circle + label + count + sub-label. Grid 2-col → 3-col at 390px → 5-col with dividers at `md`.
4. **4-panel row** (`lg:grid-cols-2 xl:grid-cols-4`):
   - **Payment Status** — a hand-built `conic-gradient` donut (88px) showing Paid / Cleared / Outstanding split with tenant count in the hole, plus a 3-row legend.
   - **Outstanding Rent** — up to 3 tenant rows (name, property + unit, balance, status pill). Empty state: green "No unpaid tenants for this period."
   - **Recent Activity** — up to 4 payment/expense rows with a circular arrow icon, title, detail + date, and a signed `+`/`-` amount in green/red.
   - **Live Calendar** — month label, "Today: …", a 7-column mini month grid where today is a green filled circle and event days get a colored dot (green/amber/red), then a "Today's Events" list of up to 2.
5. **Alerts strip** — amber-tinted bar with up to 3 alert chips and a "View calendar" link. Empty state is a green "no urgent alerts" chip.

### 5.5 `/properties`
Pattern-A header + "New Property". A single-input search form card. Then one `.data-table`: Property (green initial-letter avatar + name link), Location (inline **raw SVG** pin — not lucide), Units (count + `{occupied}/{total} occupied` green badge), Actions (View / Edit / Delete). Rich empty state: a 48px mint rounded square with a **raw inline SVG** building icon, "No properties found", a hint line, and an "Add Property" button.

### 5.6 `/properties/[id]` — Property detail / summary
- Header: "← Back to properties", green uppercase "PROPERTY SUMMARY" eyebrow, property name, location; right side has a month `<input type="month">` + View, a green "Download Report" button, and an outlined "Edit".
- **6 clickable summary cards** (`PropertySummaryCards`, 1 → 2 → 3 → 6 columns): Units, Tenants, Rent Roll, Paid, Outstanding, Expenses. Each is a `<button>` with an icon chip in one of 4 tones (green/amber/rose/slate), an uppercase 11px label, an `ArrowUpRight` affordance, a `clamp(1.25rem,1.7vw,1.9rem)` value, and a sub-line. Hover lifts `-0.5` and borders emerald. Clicking opens a **full detail modal** (portal, bottom-sheet on mobile / centered `max-w-6xl` on desktop, `rounded-t-2xl` → `rounded-2xl`, header with title + description + close, scrollable body containing a `.data-table`).
- Then a full "Units, tenants, rent, and balances" table: Unit, Tenant (name + phone), Monthly Rent, Paid, Outstanding, Expenses, Status badge.
- Then two side-by-side "Recent payments" / "Recent expenses" cards with an "all time" total in the corner and up to 8 rows each.

### 5.7 `/units`
Pattern-A header + "New Unit". Three stat tiles (Total Units white / Occupied mint / Vacant amber — the third spans 2 columns below 430px). A filter form (search + status select + Filter + Clear). **Two mutually exclusive bodies**: if a search or status filter is active, a flat results `.data-table` (Unit, Property, Monthly Rent, Status badge, Actions); otherwise a **grid of property cards** (icon tile, name, location, 3 mini stats Units/Occupied/Vacant) each with a "View units" button opening `PropertyUnitsModal`.

### 5.8 `/units/new`, `/units/[id]/edit`
Centered `max-w-2xl` page: a back link with a **raw inline SVG chevron**, `text-2xl sm:text-3xl font-bold` title, subtitle, then a white bordered card containing `UnitForm`: Property select, Unit number + Monthly rent (2-col at `sm`), Status select (edit only), then `.form-actions` with a green save button and an outlined Cancel.

### 5.9 `/tenants`
Pattern-A header + "New Tenant". Search form. Then:
- **With a search query** → `TenantSearchResults`: a table (Tenant name as a button, Property/Unit, Contact, Monthly Rent, Next Scheduled + balance + **carried-forward note**, Status pill, "View details" button) and a **portal detail modal** — header with avatar chip, name, active pill, property/unit; a bordered `<dl>` with Phone/Email, Property/Unit, Monthly rent/Billing frequency, Move in/Next scheduled, Rent status pill/**Total amount demanded** with the carry-forward note; then a **"How this balance builds up"** block listing each unpaid month with a "CARRIED" tag and a total row; footer with View property / Edit tenant / Record payment.
- **Without a query** → a grid of **property cards** (icon tile, name, location, 3 mini stats Tenants/Active/Inactive) each with a "View tenants" button opening `PropertyTenantsModal`: a sticky search bar, an "N of M tenants" counter, and a table (Tenant avatar+name+email, Unit, Contact, Move In Date, **Next Scheduled** with status pill + carry-forward note + "X for Sep 2026" line, Status, Actions: Record Payment / Edit / Delete).

### 5.10 `/tenants/new`, `/tenants/[id]/edit` — `TenantForm`
`max-w-2xl` card. Fields in order:
1. **Unit picker** — a large `min-h-[52px]` button showing the chosen unit, opening a modal: a property `<select>`, then an "Available units" header with a count pill, a search input, and a list of unit buttons (unit number, `UGX x/mo`, Occupied/Vacant); occupied units are disabled. Empty states for "select a property first" (dashed box with a Home icon) and "no available units" (amber box).
2. Full name, Phone, Email.
3. Move-in date (`<input type="date">`) + a **read-only** "Period end / next scheduled date" display.
4. **Rent period section** (new tenants only, wrapped in `border-y`): duration chips `1 mo / 3 mo / 6 mo / 12 mo` + a custom number input, styled with inline hex (`#00A550` border + `#e6f7ef` fill when active).
5. A "Record first payment now" checkbox → reveals First payment amount + Payment method, **or** shows an amber warning box computing exactly how much will be outstanding.
6. "Active tenant" checkbox in a bordered row.
7. `.form-actions`.

### 5.11 `/payments`
Pattern-A header + "Record Payment". `PaymentFilters` card: a 6-column `lg` grid — Search payments, Property select, Period select (All time / Day / Month / Year), a **context-dependent 4th control** that swaps between `<input type="date">`, `<input type="month">`, a year `<select>`, or a disabled "All recorded dates" box, then Filter and Clear buttons. Then a 2-up summary card (Payments found / Filtered total). Then a grid of **property cards**: icon tile, name, location, 2 mini stats (Payments count / Total paid), a new amber line "`X demanded from N tenants — includes Y carried forward`", and a "View payments" button opening `PropertyRecordsModal` containing:
   - **`TenantRentDemandList`** — an "Amount demanded from tenants" panel on a tinted ground, with a total in the header and one card per owing tenant (name, unit + rent/mo, "TOTAL DEMANDED" figure, an amber carry-forward box with the month breakdown, "Next scheduled …", and a "Record payment" link).
   - Then the payments `.data-table`: Tenant (avatar + name + email), Unit, **Rent Coverage** (month list + "N months" + a per-month allocation breakdown where months before the payment date get an "ARREARS" tag), Amount Paid (green), Remaining Balance, Date Paid, Method badge, Actions (Receipt download / Edit / Delete).

### 5.12 `/payments/new`, `/payments/[id]/edit` — `PaymentForm`
`max-w-2xl` card. In order:
1. **Unit/tenant picker** — `min-h-[52px]` button → modal with a **two-step flow**: first a searchable property list (each row: icon chip, name, "N occupied units"), then a searchable tenant list (each row: Unit number, name + rent/mo, phone/email, and on the right a status label "OUTSTANDING" amber / "PAID UP" emerald, the amount due, the next scheduled date, and a compact `+UGX X carried` chip).
2. **Selected-tenant summary panel** — a slate card with 3 columns (Monthly rent / status + amount + "Next scheduled …" / Already paid + "Extra money carries forward."), plus conditionally an **amber "Balance carried forward" box** with a month-by-month breakdown, or an **emerald "no rent due yet — this will be recorded in advance for {Month}"** note.
3. Amount paid (numeric text input) + a read-only "Applies first to {Month}" display.
4. **Rent coverage section** — explanatory copy, a "Coverage starts" date input + a read-only "Coverage ends" display, then the same duration chips (1/3/6/12 + custom).
5. Payment date + Payment method select (Cash / Bank transfer / Mobile money / Card / Other).
6. Notes textarea.
7. `.form-actions`.

### 5.13 `/expenses`
Pattern-A header + "New Expense". Search form (preserves an optional month filter via a hidden input). A `.data-table`: Expense Details (title + description), Property & Unit, **Category badge with per-category colors** (Renovations amber, Repairs rose, Cleaning sky, Plumbing teal, Electricity yellow, default slate), Amount, Date Paid, Actions. Rich empty state with a rose tile and a **raw inline SVG** money icon.

### 5.14 `/expenses/new`, `/expenses/[id]/edit` — `ExpenseForm`
`max-w-2xl` card: Property select, Unit select (with a "No unit (Entire Property)" option), Title, Category select (repairs / renovation / cleaning / plumbing / electricity / other), Amount, Date, Description textarea, `.form-actions`.

### 5.15 `/calendar`
- Header: green uppercase "RENT CALENDAR" eyebrow, "Calendar" title, subtitle. Right: a "Today" pill and a 3-way segmented control (month / week / day) rendered as links in a bordered white pill container.
- Optional alerts row: up to 4 small bordered cards.
- Main grid `xl:grid-cols-[1fr_20rem]`:
  - **Calendar**: a 7-column weekday header (hidden in day view), then day cells `min-h-[4.75rem]` → `5.75rem`. Out-of-month days get a `#f8fafc` tint, today gets a green filled circle, the selected day gets a 2px inset green ring. **Events render as tiny 6px colored dots on mobile and as truncated colored chips at `sm`+**, max 2 per cell in month view with a "+N" overflow line.
  - **Sidebar**: the selected date, "Today"/"Selected day" label, then event cards tinted by severity (success green / warning amber / danger red / info blue).

### 5.16 `/reports`
- Pattern-A header + an inline 5-part filter form (Period select: Selected month / All time; Report Month `<input type="month">`; View button).
- **`ReportScopeDownload`** card: a "Report scope" select (Overall portfolio, or a specific property) plus 4 download buttons in a 2→4 column grid (Portfolio/Property report, Monthly/All-time rent, Unpaid tenants, Cash flow) — mint-tinted with emerald borders.
- **4 summary cards**: Rent Collected (green), Outstanding Rent (amber), Expenses (rose), Net Cash Flow (green or red by sign).
- **`lg:grid-cols-3` split**:
  - **Tenant Rent Report** (2 cols) — heading, a slate count chip "N paid, M outstanding", and a `.data-table` (Tenant, Property/Unit, Expected, Paid, Balance, Status badge).
  - **Expense Breakdown** (1 col) — per-category rows with a label, `UGX x (n%)`, and a **hand-built rose progress bar**.
- **Property Performance Summary** — a 9-column `.data-table`: Property, Location, Occupancy badge, Expected/Tracked Rent, Collected, Outstanding, Expenses, Net Cash Flow, and a per-row Download button. ⚠️ 9 columns is the widest table in the app and stacks into a very tall card on mobile.

### 5.17 `/settings`
Eyebrow + "Settings" + subtitle, plus an "Open Admin Portal" button for admins. Then `xl:grid-cols-[1.25fr_.9fr_.85fr]`:
- **Profile card** — Clerk avatar (or a green initial tile) with a green 2px border, name, an `accountStatus` badge with a check icon, email, phone, then a 2-col grid of 4 read-only "SettingRow" boxes (Role / Last seen / Approved / Created).
- **Access Control card** — lock icon chip, 3 SettingRows (Admin portal / Account status / Login provider).
- **System Defaults card** — user icon chip, 2 rows with icons (Currency = Ugandan Shilling (UGX); Date and time = Africa/Kampala, en-UG).

⚠️ This screen is entirely **read-only** — there is nothing a landlord can actually change. Consider what genuinely belongs here.

### 5.18 `/admin` (admin only)
Eyebrow "PLATFORM OWNER" + "Admin Panel" + subtitle, and an `AdminSupportInbox` trigger button (emerald outline, message icon, unread count pill) that opens a large two-pane inbox — a conversation list beside a message thread, full-screen on mobile and a `58rem × 44rem` panel at `lg`.
Then 4 centered stat cards (Users / Properties / Tenants / Payments) and a `.data-table` of every landlord: User (name, email, phone), Status badge + role, Created, Last seen, Portfolio ("N properties, M tenants"), Financials ("X paid, Y expenses"), Actions (`AdminUserActions`: approve / reject / suspend / reactivate).

### 5.19 Support chat (`SupportChatWidget`, landlords only)
Two triggers: a sidebar "Need help? / Chat with admin" card on desktop, a headphones icon button on mobile — both with an unread count pill. Opens a portal panel: full-screen on mobile, `25rem × 36rem` docked bottom-right at `sm` (and pinned left of the sidebar at `lg`). Header with an avatar chip + online dot, "Estate Core support" / "Admin support". A `slate-50` message area with **chat bubbles** — mine = emerald-600 white text `rounded-2xl rounded-br-md`, theirs = white bordered `rounded-bl-md` — each with a 10px timestamp. An empty state ("How can we help?"). An amber "this conversation ended" strip when closed. A composer: auto-growing textarea in a rounded tray with a circular emerald send button; Enter sends, Shift+Enter newlines.

### 5.20 Shared states
- **Loading** — every route has a `loading.tsx` that renders the *same* bare spinner: `animate-spin rounded-full h-8 w-8 border-b-2 border-green-600`. A much nicer `AppLoading` component (logo tile with a pinging dot + "Preparing EstateCore UG") **exists but is never used**.
- **Delete confirmation** (`DeleteButton`) — a rose outlined button that opens a fixed overlay with a white `max-w-sm` card: "Confirm delete", a contextual message, an optional error strip, then Cancel / red Delete. ⚠️ It is built entirely from `<span>` elements with no `role="dialog"`, no focus trap, and no Escape handling.
- **Form errors** (`FormNotice`) — a rose (or green) tinted bordered strip above the form.
- **Empty states** — wildly inconsistent: sometimes a 48px tinted tile + raw SVG + heading + hint + CTA, sometimes a single centered grey sentence, sometimes a tinted pill.

---

## 6. Known problems to solve

These are real defects I want the redesign to fix. Treat them as the brief's success criteria.

**Consistency**
1. **Three ways to say "green".** The same brand color appears as `var(--brand)`, `style={{ backgroundColor: '#00A550' }}`, `bg-emerald-600`, and `text-emerald-700`, sometimes within one component. Produce one token set and one rule for when each is used.
2. **Two page-header patterns** (§4) and two page rhythms — the dashboard uses `space-y-3` with 10–12px type while list pages use `space-y-6` with 24–30px titles. Pick one system.
3. **Inconsistent status color semantics.** "Outstanding" is rose in the tenants modal, orange on the dashboard, `red-100` in reports, and amber on the property page. Define one semantic palette (paid / partial / due soon / due today / overdue / advance / vacant / inactive) and apply it everywhere.
4. **Confusing status vocabulary.** "Paid" vs "Cleared" vs "Outstanding" — "Cleared" currently means *no debt and no payment on record*, which no landlord will guess. Rename and define the full set.
5. **Raw inline SVGs** in Properties, Expenses, and all five `/new` pages, alongside lucide everywhere else.
6. **`font-black` (900) is used for almost everything**, which flattens hierarchy — a 10px label and a 30px page title carry the same weight. Design a real type scale.
7. **Three separate modal implementations** (`PropertyRecordsModal`, the inline modal in `PropertySummaryCards`, the inline modal in `TenantSearchResults`) plus the non-semantic `DeleteButton` overlay. Specify **one** modal/sheet pattern: bottom sheet on mobile, centered dialog on desktop, with defined sizes, header, scroll behavior, and close affordances.
8. **Inconsistent empty states** (§5.20). Define one empty-state component with size variants.
9. **Every route shows the same bare spinner** while a far better `AppLoading` sits unused. Design proper loading treatments — ideally **skeletons** that match each page's layout.

**Comprehension**
10. **Carried-forward rent is the #1 confusion.** A tenant owing 1,000,000 has no visible explanation that 500,000 of it is August arrears. There is now a small amber note, a month breakdown list, and an "ARREARS" tag on payment allocations — but it was bolted on. **Design this properly** as a first-class pattern: how a composed balance is shown in a table cell, in a card, in a detail view, and in the payment form. This is the highest-value item in the brief.
11. **Advance payments need a visual identity.** A landlord recording money for a future month should see something clearly different from settling a debt. Currently it is a green "Paid up" label and a sentence.
12. **Fabricated data on the dashboard.** The KPI sparklines use hard-coded points and the up/down trend arrows are hard-coded props — they imply a trend that was never computed. Either design an honest alternative or remove them.
13. **Long UGX strings break layouts.** `UGX 12,500,000` is wide, and the codebase is littered with `truncate`, `[overflow-wrap:anywhere]`, and `max-w-[7rem]` patches. Design a deliberate approach to money display (tabular figures, abbreviation rules, alignment, where full precision is required).

**Mobile and ergonomics**
14. **Body text shrinks from 16px to 14px on desktop** — backwards from the usual direction. Justify or change it.
15. **Wide tables stack into very tall cards** on mobile (the 9-column Reports table becomes 9 stacked label/value rows per property). Design a better mobile representation for dense tables.
16. **Small touch targets.** Table action buttons are `text-xs px-3 py-1.5` — roughly 30px tall, below the 44px minimum, even though `.field-input` and `.form-actions` correctly enforce 44px.
17. **Navigation split is arbitrary.** 5 items in the bottom bar and 4 hidden behind a hamburger, with no signal that Reports and Calendar exist. Rethink the mobile information architecture.
18. **Two floating layers compete on mobile** — the bottom nav and the support chat button.

**Accessibility**
19. `DeleteButton` has no dialog semantics, no focus trap, no Escape key.
20. Several color pairings need contrast verification: `text-emerald-50/75` on the sidebar, `text-slate-400` hints, 9.5–10px uppercase labels, and amber-on-amber notes.
21. Status is often conveyed by color alone in the calendar dot grid and the dashboard donut.

---

## 7. What to deliver

A **design canvas** with the artboards below. Group them logically and label each one clearly.

**A. Foundations (1–2 artboards)**
- Full color system: brand ramp, neutral ramp, and a **semantic set** (success / warning / danger / info / advance / arrears / vacant / inactive) with hex values and contrast ratios against their backgrounds.
- Type scale: every size/weight/line-height pairing with its intended role, for mobile and desktop.
- Spacing scale, radii, elevation/shadow set, border treatments.
- Icon usage rules (sizes, stroke widths, when an icon gets a tinted chip).

**B. Component library (2–3 artboards)**
Buttons (primary / secondary / ghost / destructive × default / hover / active / disabled / loading, in 44px and compact sizes), inputs, selects, date & month pickers, checkboxes, the duration-chip group, badges/pills in every semantic state, cards, stat/KPI cards, the modal/sheet pattern, the table pattern **with its mobile stacked form**, empty states, loading skeletons, toasts or inline notices, avatars, the notification dropdown, chat bubbles, and — importantly — a dedicated **"composed balance" component** showing total + current month + carried-forward months.

**C. Screens — mobile (390 × 844) and desktop (1440 × 900)**
Every screen in §5. At minimum both widths for: Landing, Sign in, Pending approval, Dashboard, Properties, Property detail, Units, Tenants, Tenant detail modal, Payments, Payment form, Expenses, Calendar, Reports, Settings, Admin. Single width is acceptable for the simpler form pages if you show the shared form template.

**D. Flows (1–2 artboards)**
- **Record a payment**, in three variants: settling arrears, paying current rent, and paying in advance — showing exactly what changes between them.
- **Onboarding**: sign up → pending approval → first property → first unit → first tenant → first payment (the empty-state journey a brand-new landlord actually sees).

**E. A change summary artboard**
A prioritized list of what changed and why, mapping back to the numbered problems in §6, flagged as high / medium / low implementation effort.

---

## 8. Rules — do not break these

1. **Do not change information architecture or feature set.** Same routes, same data, same capabilities. You may re-group navigation and re-order content within a screen; you may not remove features or invent new ones.
2. **Everything must be buildable in Tailwind v3 + lucide-react + hand-written CSS.** No new libraries, no component kits, no icon sets, no charting library.
3. **Mobile-first.** More than half of real usage is on a phone, often on slow mobile data. If a desktop idea degrades the phone experience, drop it.
4. Preserve **44px minimum touch targets**, the **16px mobile input font** (iOS zoom), and **safe-area insets** at the top and bottom.
5. Keep the **brand green `#00A550`** and the dark green `#071a0f` / `#063f35` family. You may refine and extend the ramp; do not rebrand.
6. Keep every screen usable at **320px** width without horizontal scroll on the page body. Tables may scroll inside their own container.
7. **Respect the data.** Do not design placeholder charts or metrics the app does not compute. If a visualization needs data that doesn't exist, say so explicitly and mark it as a future enhancement.
8. **Use realistic Ugandan content**: names like Grace Auma, Moses Okello, Sarah Nakato; places like Ntinda, Bugolobi, Kira, Muyenga, Kampala; rents in the 300,000–2,500,000 UGX range; phone numbers like +256 751 929 535; unit numbers like A1, B4, G2.
9. **Show real states, not just the happy path.** Include empty, loading, error, single-item, and overflow (40+ units, a tenant 5 months in arrears) variants for the key screens.
10. **Annotate.** Every artboard should carry short notes explaining intent, the tokens used, and anything an engineer would otherwise have to guess.

---

## 9. Design direction

Aim for: **calm, credible, financial.** This tool handles someone's rent income — it should feel closer to a well-made banking app than to a startup dashboard. Dense where density earns its keep (tables, ledgers), generous where comprehension matters (balances, payment flows, alerts). The existing green is warm and distinctive; build around it rather than burying it under grey. Prioritize legibility and hierarchy over decoration, and make the money numbers the loudest thing on every screen they appear on.
