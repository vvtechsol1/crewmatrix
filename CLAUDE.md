# CrewMatrix

Two-sided construction bidding marketplace: general contractors post projects, licensed
subcontractors bid on radius-matched work. Forked from the CrewLoop build on 29 Jul 2026;
this folder is the independent CrewMatrix product.

## Stack
- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS 4 (tokens in `app/globals.css`)
- GSAP + SplitText + Lenis (`components/motion-provider.tsx` — data-attribute driven: `data-split`, `data-cascade`, `data-reveal`, `data-reveal-child`, `data-reveal-row`, `data-counter`, `data-parallax`)
- three.js — `components/landing/hero-model.tsx` (hero diorama) and `components/landing/how-it-works-3d.tsx` (pinned scroll-build section), both lazy-loaded, both DOM-only procedural (no model files)
- Supabase: Postgres + RLS (`supabase/schema.sql` — policies are the security model; bids are per-company), Auth over REST (`lib/auth.ts`, httpOnly cookie `cl_session`)
- Stripe Billing + Connect scaffolding (`lib/stripe.ts`, keys not set)
- Deploy: Cloudflare Workers via `@opennextjs/cloudflare`

## Layout / routing
Route groups: `(site)` marketing + gated marketplace pages, `(auth)` split-screen auth,
`(setup)` onboarding wizard, `(app)` sidebar workspace. `middleware.ts` gates EVERYTHING
except `/`, `/login`, `/signup`, `/forgot-password`, `/pricing`, `/how-it-works` — the whole
marketplace requires a session (reference-product behaviour).

## Colours
White body · royal blue `--color-hi-500 #2649d8` (primary/actions) · vivid gold
`--color-gold-500 #f5b301` (Sign up CTA, accents — Sign up is ALWAYS gold) · deep navy
`navy-900/950` (hero overlay, bands). Two-tone headings: blue title + gold accent via
`SectionHead`'s `accent` prop.

## Commands (PowerShell 5.1 — no `&&`)
```powershell
npm run dev          # local
# deploy — ALWAYS build first; `opennextjs-cloudflare deploy` alone does NOT rebuild:
$env:CLOUDFLARE_API_TOKEN="<from .env.local>"; $env:CLOUDFLARE_ACCOUNT_ID="<from .env.local>"
node_modules\.bin\opennextjs-cloudflare.cmd build
node_modules\.bin\opennextjs-cloudflare.cmd deploy
```
Worker name in `wrangler.jsonc` is `crewmatrix` → deploys to
`https://crewmatrix.vvtechsol1.workers.dev` (separate from crewloop).

## Credentials
`.env.local` (not committed): SUPABASE_URL, SUPABASE_ANON_KEY (publishable), plus
CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID for deploys. Supabase project
`wwtdyfadxbwpoezxrcsq` is currently SHARED with crewloop (same DB, same auth users). For a
separate CrewMatrix database: create a new Supabase project, run `supabase/schema.sql` then
`supabase/seed.sql` (`scripts/migrate.mjs` automates it; needs SUPABASE_PROJECT_REF +
SUPABASE_DB_PASSWORD env), and update `.env.local` + `wrangler.jsonc` vars.

## Gotchas learned the hard way
- `opennextjs-cloudflare deploy` only uploads the existing `.open-next` — run `build` first,
  and verify a fresh marker exists in `.next\server\app\index.html` before deploying.
- Cloudflare free tier: never let marketing pages SSR per-request (Error 1102). Everything
  is static/SSG; keep it that way. Filters run client-side.
- Supabase "Confirm email" must stay OFF in Auth settings or signups can't enter the portal.
- PowerShell writes UTF-8 BOM; SQL files with BOM break `pg` — strip BOM if editing SQL.
- Edge cache serves stale HTML for ~30s after deploy — verify with `/?v=<random>`.
- Reduced-motion: every animation has a CSS off-switch; keep that invariant for new ones.

## End-to-end verification
`node scripts/verify-flow.mjs https://crewmatrix.vvtechsol1.workers.dev` — checks route
gating, signup→company row, bid→Postgres attribution, RLS on every table (needs
SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD env for the read-back). `scripts/cleanup-probes.mjs`
removes the throwaway accounts it creates.
