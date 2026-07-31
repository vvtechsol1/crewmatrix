# CrewMatrix

A two-sided marketplace for construction: general contractors post scope, subcontractors bid on
work inside their travel radius, and the money moves on the same record as the agreement.

Built with **Next.js 16 · React 19 · Tailwind CSS 4 · Supabase Postgres · Stripe**, deployed to
Cloudflare Workers through `@opennextjs/cloudflare`.

---

## What is here

| Route | What it does |
|---|---|
| `/` | Landing — how the marketplace works, open work, verified crews |
| `/find-work` | Subcontractor view. Filter by trade, distance and budget floor |
| `/find-pros` | Contractor view. Filter by trade and compliance status |
| `/projects/[id]` | Scope, requirements, every bid side by side, project thread |
| `/pros/[id]` | Company profile — compliance dates, coverage, bid or post history |
| `/pricing` | Subscription tiers, Stripe Checkout |
| `/dashboard/contractor` | Projects, bids to review, committed value, compliance drift |
| `/dashboard/sub` | Matched work, bid history, win rate, payouts, Connect onboarding |
| `/api/stripe/checkout` | Creates a subscription Checkout Session |
| `/api/stripe/connect` | Starts Connect Express onboarding for a subcontractor |
| `/api/webhooks/stripe` | Signature-verified webhook receiver |

## The parts worth reading

**`supabase/schema.sql`** — tables plus row-level security. On a marketplace the security model
*is* the product: a subcontractor may read only its own bids, while the contractor who owns the
project reads all of them. That is enforced in Postgres, not in a route handler, because an
app-layer check is one forgotten endpoint away from leaking a competitor's price.

**`lib/db.ts`** — one data-access layer for the whole app. With `SUPABASE_URL` and
`SUPABASE_ANON_KEY` set it reads Postgres through PostgREST; without them it serves the bundled
dataset, so the marketplace is never a blank screen. Row shapes are identical either way.

**`lib/stripe.ts`** — Billing and Connect are different products and are easy to conflate.
Billing is the monthly subscription a company pays the platform. Connect is how a subcontractor
gets paid for completed work, and it needs onboarding, identity checks and transfers. Both are
implemented as form-encoded REST calls so the worker bundle stays small.

**`app/api/webhooks/stripe/route.ts`** — signature verification with Web Crypto (works on a
Worker, unlike the Node SDK path), including a replay window and a constant-time compare.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Copy `.env.example` to `.env.local` to point at a real Supabase project and Stripe account. With
no keys the app still runs end to end; billing buttons report that billing is not configured
rather than failing silently.

```bash
npm run build        # production build
npm run cf:deploy    # build + deploy to Cloudflare Workers
```

## Database

Apply the schema to a Supabase project:

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
```

`current_company_id()` resolves `auth.uid()` to the caller's company row; every policy is written
against it, so adding a table means adding one policy rather than auditing the whole app.
