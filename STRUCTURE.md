# CrewMatrix — build structure

Har block ke saath ye likha hai ke wo kya karta hai aur abhi kis halat mein hai.

Legend: ✅ ban chuka · 🔨 is round mein ban raha hai · ⬜ agla round

---

## A. Public / marketing

| # | Route | Block | Halat |
|---|---|---|---|
| A1 | `/` | **Hero** — headline, sub, do CTA (Find subcontractors / Post a project), trust strip | 🔨 |
| A2 | `/` | **Audience split** — do bade cards: "I hire crews" vs "I look for work", har ek ka apna rasta | 🔨 |
| A3 | `/` | **How it works** — 4 steps, dono taraf ke liye | ✅ |
| A4 | `/` | **Trades grid** — 12 trades, har ek clickable filter link | 🔨 |
| A5 | `/` | **Open work preview** — live projects ke cards | ✅ |
| A6 | `/` | **Verified crews preview** — subcontractor cards | ✅ |
| A7 | `/` | **Pricing preview** — GC / Sub toggle ke sath | 🔨 |
| A8 | `/` | **Proof strip** — rating, members, trades (sirf wo aankre jo asli hon) | 🔨 |
| A9 | `/` | **Final CTA** | 🔨 |
| A10 | `/how-it-works` | Alag safha — dono roles ka poora flow, screenshots ke sath | 🔨 |
| A11 | `/pricing` | Role toggle + FAQ | ✅ (toggle 🔨) |
| A12 | `/find-work` | Trade / radius / budget filters | ✅ |
| A13 | `/find-pros` | Trade / compliance filters | ✅ |
| A14 | `/projects/[id]` | Scope, requirements, bids, thread | ✅ |
| A15 | `/pros/[id]` | Company profile, compliance, history | ✅ |

## B. Auth

| # | Route | Block | Halat |
|---|---|---|---|
| B1 | `/login` | Split layout — bayen taraf value props + testimonial, dayen form. Google/Apple, email+password, remember me, forgot | 🔨 |
| B2 | `/signup` | **Step 1** — role chuno: General contractor ya Subcontractor (do bade cards) | 🔨 |
| B3 | `/signup` | **Step 2** — naam, email, password, phone | 🔨 |
| B4 | `/signup` | **Step 3** — company basics: company name, city/state, years | 🔨 |
| B5 | `/forgot-password` | Email daalo → link bhej diya wali halat | 🔨 |
| B6 | `/onboarding` | **Wizard** — trades chuno → service radius → licence → insurance → review. Progress bar ke sath | 🔨 |

## C. App shell (sidebar wala workspace)

| # | Route | Block | Halat |
|---|---|---|---|
| C1 | `/dashboard/*` | **Sidebar layout** — role ke hisaab se nav, upar company switcher | 🔨 |
| C2 | `/dashboard/contractor` | Stats, projects + bids table, compliance alert | ✅ |
| C3 | `/dashboard/sub` | Matched work, bids, win rate, payouts, Connect | ✅ |
| C4 | `/projects/new` | **Post a project** — 4 step form: basics → scope → budget/schedule → review & publish | 🔨 |
| C5 | `/projects/[id]/bid` | **Submit a bid** — amount, crew, start date, note → review → confirmation | 🔨 |
| C6 | `/messages` | Inbox — thread list + selected thread, project se juri hui | 🔨 |
| C7 | `/settings/profile` | Company profile edit | ⬜ |
| C8 | `/settings/billing` | Plan, invoices (Stripe) | ⬜ |
| C9 | `/settings/payouts` | Connect account status | ⬜ |
| C10 | `/settings/team` | Team members, roles | ⬜ |

## D. Cross-cutting

| # | Block | Halat |
|---|---|---|
| D1 | Auth state — abhi client-side mock. Supabase Auth lagne par `auth.uid()` → `current_company_id()` | 🔨 mock |
| D2 | RLS policies — `supabase/schema.sql` | ✅ |
| D3 | Stripe Billing + Connect | ✅ code, keys baaki |
| D4 | Empty states, loading states, 404 | ✅ 404, baaki 🔨 |
| D5 | Mobile nav (hamburger) | 🔨 |

---

## Flows jo end-to-end samajh aane chahiye

1. **Naya subcontractor**: landing → signup (role: sub) → onboarding wizard → dashboard → matched work → project → submit bid → confirmation → bid dashboard mein nazar aati hai
2. **Naya general contractor**: landing → signup (role: GC) → onboarding → dashboard → post a project (4 steps) → publish → bids aana shuru → compare → award
3. **Wapas aane wala user**: login → dashboard
4. **Baat-cheet**: project → message → inbox mein thread
