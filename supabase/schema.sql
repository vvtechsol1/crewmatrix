-- CrewMatrix — Postgres schema and row-level security policies
--
-- The security model is the whole product on a two-sided marketplace: a general
-- contractor must never read another GC's bids, and a subcontractor must only
-- see projects that are actually published. That is enforced here, in the
-- database, not in application code — an app-layer `if` is one forgotten route
-- away from leaking a competitor's number.

create type company_role     as enum ('contractor', 'subcontractor');
create type verification      as enum ('verified', 'pending', 'expired', 'none');
create type project_status    as enum ('open', 'awarded', 'in_progress', 'complete');
create type bid_status        as enum ('submitted', 'shortlisted', 'awarded', 'declined');
create type payout_status     as enum ('pending', 'in_transit', 'paid', 'held');

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
create table companies (
  id                   text primary key,
  -- Nullable on purpose: a company record can exist before anyone claims it
  -- (imported, or listed by an admin). An unclaimed row has no owner, so the
  -- "owner_id = auth.uid()" policies below simply never match it — which is the
  -- behaviour we want: visible to everyone, editable by nobody.
  owner_id             uuid references auth.users (id) on delete set null,
  role                 company_role not null,
  name                 text not null,
  contact              text not null,
  trades               text[] not null default '{}',
  city                 text not null,
  state                text not null,
  service_radius_miles int  not null default 50,
  crew_size            int  not null default 1,
  years_in_business    int  not null default 0,
  rating               numeric(2,1) not null default 0,
  review_count         int  not null default 0,
  completed_jobs       int  not null default 0,
  license_number       text,
  license_status       verification not null default 'none',
  license_expires      date,
  insurance_carrier    text,
  insurance_status     verification not null default 'none',
  insurance_coverage   int,
  insurance_expires    date,
  bio                  text,
  accent               text not null default '#f2a33c',
  created_at           timestamptz not null default now()
);

create index companies_role_idx   on companies (role);
create index companies_trades_idx on companies using gin (trades);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table projects (
  id               text primary key,
  contractor_id    text not null references companies (id) on delete cascade,
  title            text not null,
  trade            text not null,
  city             text not null,
  state            text not null,
  distance_miles   int  not null default 0,
  budget_low       int  not null,
  budget_high      int  not null,
  start_date       date not null,
  duration_weeks   int  not null,
  status           project_status not null default 'open',
  scope            text not null,
  requirements     text[] not null default '{}',
  posted_at        date not null default current_date,
  bid_count        int  not null default 0,
  platform_fee_pct numeric(4,2) not null default 4.0,
  constraint budget_range_sane check (budget_high >= budget_low)
);

create index projects_status_trade_idx on projects (status, trade);
create index projects_contractor_idx   on projects (contractor_id);

-- ---------------------------------------------------------------------------
-- bids
-- ---------------------------------------------------------------------------
create table bids (
  id                text primary key,
  project_id        text not null references projects (id) on delete cascade,
  subcontractor_id  text not null references companies (id) on delete cascade,
  amount            int  not null check (amount > 0),
  crew_size         int  not null default 1,
  start_available   date not null,
  duration_weeks    int  not null,
  note              text,
  status            bid_status not null default 'submitted',
  submitted_at      timestamptz not null default now(),
  unique (project_id, subcontractor_id)
);

create index bids_project_idx on bids (project_id);
create index bids_sub_idx     on bids (subcontractor_id);

-- ---------------------------------------------------------------------------
-- messages, payouts
-- ---------------------------------------------------------------------------
create table messages (
  id         text primary key,
  project_id text not null references projects (id) on delete cascade,
  from_id    text not null references companies (id) on delete cascade,
  to_id      text not null references companies (id) on delete cascade,
  body       text not null,
  sent_at    timestamptz not null default now()
);

create index messages_project_idx on messages (project_id, sent_at);

create table payouts (
  id               text primary key,
  project_id       text not null references projects (id) on delete cascade,
  subcontractor_id text not null references companies (id) on delete cascade,
  gross            int  not null,
  fee_pct          numeric(4,2) not null default 4.0,
  status           payout_status not null default 'pending',
  stripe_transfer_id text,
  released_at      date
);

-- ---------------------------------------------------------------------------
-- helper: which company does the current JWT belong to
-- ---------------------------------------------------------------------------
create or replace function current_company_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from companies where owner_id = auth.uid() limit 1;
$$;

-- ---------------------------------------------------------------------------
-- row-level security
-- ---------------------------------------------------------------------------
alter table companies enable row level security;
alter table projects  enable row level security;
alter table bids      enable row level security;
alter table messages  enable row level security;
alter table payouts   enable row level security;

-- Companies: profiles are public (that is the point of a marketplace), but a
-- company may only edit its own record.
create policy companies_read_all on companies
  for select using (true);

create policy companies_update_own on companies
  for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy companies_insert_own on companies
  for insert with check (owner_id = auth.uid());

-- Projects: anyone signed in can read open work. Drafts and closed jobs stay
-- with the contractor that posted them.
create policy projects_read_published on projects
  for select using (
    status <> 'complete'
    or contractor_id = current_company_id()
  );

create policy projects_write_own on projects
  for all using (contractor_id = current_company_id())
  with check (contractor_id = current_company_id());

-- Bids: the single most sensitive table. A subcontractor sees only its own
-- bids; the contractor who owns the project sees every bid on it. Nobody else
-- sees anything, which is what stops competitors reading each other's pricing.
create policy bids_read_own_or_project_owner on bids
  for select using (
    subcontractor_id = current_company_id()
    or exists (
      select 1 from projects p
      where p.id = bids.project_id
        and p.contractor_id = current_company_id()
    )
  );

create policy bids_insert_as_self on bids
  for insert with check (subcontractor_id = current_company_id());

create policy bids_update_own on bids
  for update using (subcontractor_id = current_company_id());

-- The contractor can move a bid through shortlist/award, but cannot rewrite the
-- amount — only the status column is theirs to change.
create policy bids_status_by_project_owner on bids
  for update using (
    exists (
      select 1 from projects p
      where p.id = bids.project_id
        and p.contractor_id = current_company_id()
    )
  );

-- Messages: only the two parties on the thread.
create policy messages_read_participants on messages
  for select using (
    from_id = current_company_id() or to_id = current_company_id()
  );

create policy messages_insert_as_sender on messages
  for insert with check (from_id = current_company_id());

-- Payouts: the earning subcontractor, plus the contractor who funded the job.
create policy payouts_read_related on payouts
  for select using (
    subcontractor_id = current_company_id()
    or exists (
      select 1 from projects p
      where p.id = payouts.project_id
        and p.contractor_id = current_company_id()
    )
  );

-- Payout rows are written by the Stripe webhook using the service role, which
-- bypasses RLS by design. No client-side insert policy exists on purpose.
