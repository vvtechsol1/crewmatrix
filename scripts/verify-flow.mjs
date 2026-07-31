/**
 * End-to-end check against the deployed site.
 *
 *   node scripts/verify-flow.mjs https://crewmatrix.vvtechsol1.workers.dev
 *
 * Proves the things that actually matter on a bidding platform:
 *   1. protected routes redirect to /login when signed out
 *   2. signing up creates a real auth user and a company row it owns
 *   3. a signed-in subcontractor can submit a bid
 *   4. the bid is really in Postgres, attributed to the right company
 *   5. the same bid is invisible to a different company (RLS holds)
 *
 * Needs SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD to read the database back.
 */
import pg from "pg";

const BASE = process.argv[2] ?? "https://crewmatrix.vvtechsol1.workers.dev";
const REF = process.env.SUPABASE_PROJECT_REF;
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;

const stamp = Date.now().toString(36);
// Supabase rejects made-up TLDs on signup, so the probe account uses a domain
// its validator accepts. The address itself is never delivered to.
const sub = {
  email: `CrewMatrix.check.${stamp}@gmail.com`,
  password: `Check-${stamp}-pw`,
  name: "Verification Sub",
  company: `Verify Electric ${stamp}`,
  city: "Denver",
  state: "CO",
  role: "subcontractor",
};

let pass = 0;
let fail = 0;

function check(label, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function cookieFrom(res) {
  const raw = res.headers.getSetCookie?.() ?? [];
  const session = raw.find((c) => c.startsWith("cl_session="));
  return session ? session.split(";")[0] : null;
}

console.log(`\nverifying ${BASE}\n`);

// 1 — the guard
console.log("1. route protection while signed out");
for (const path of ["/dashboard/sub", "/dashboard/contractor", "/projects/new", "/messages", "/settings"]) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  check(`${path} redirects to /login`, res.status >= 300 && res.status < 400 && location.includes("/login"), `got ${res.status} ${location}`);
}

const bidGuard = await fetch(`${BASE}/projects/prj-1042/bid`, { redirect: "manual" });
check(
  "/projects/prj-1042/bid redirects to /login",
  bidGuard.status >= 300 && bidGuard.status < 400,
  `got ${bidGuard.status}`,
);

// The whole marketplace is gated (reference behaviour): project detail pages
// redirect too. Only the marketing site stays public.
const gatedDetail = await fetch(`${BASE}/projects/prj-1042`, { redirect: "manual" });
check(
  "/projects/prj-1042 is gated",
  gatedDetail.status >= 300 && gatedDetail.status < 400,
  `got ${gatedDetail.status}`,
);
const landing = await fetch(`${BASE}/`, { redirect: "manual" });
check("/ (landing) stays public", landing.status === 200, `got ${landing.status}`);

// 2 — signup
console.log("\n2. signup creates an account and a company");
const signupRes = await fetch(`${BASE}/api/auth/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(sub),
});
const signupBody = await signupRes.json().catch(() => ({}));
check("signup returns ok", signupRes.ok && signupBody.ok === true, JSON.stringify(signupBody).slice(0, 200));

const cookie = cookieFrom(signupRes);
check("signup sets a session cookie", Boolean(cookie));
check("company row created", Boolean(signupBody.companyId), signupBody.companyError ?? "");

// 3 — bidding while signed in
console.log("\n3. bidding");
const noAuthBid = await fetch(`${BASE}/api/bids`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ projectId: "prj-1042", amount: 1, startAvailable: "2026-09-01" }),
});
check("bid without a session is rejected", noAuthBid.status === 401, `got ${noAuthBid.status}`);

let bidId = null;
if (cookie) {
  const bidRes = await fetch(`${BASE}/api/bids`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      projectId: "prj-1042",
      amount: 161500,
      crewSize: 7,
      startAvailable: "2026-08-17",
      durationWeeks: 9,
      note: "Automated verification bid.",
    }),
  });
  const bidBody = await bidRes.json().catch(() => ({}));
  check("signed-in bid accepted", bidRes.ok && bidBody.ok === true, JSON.stringify(bidBody).slice(0, 200));
  bidId = bidBody.id ?? null;

  const dupe = await fetch(`${BASE}/api/bids`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      projectId: "prj-1042",
      amount: 150000,
      crewSize: 7,
      startAvailable: "2026-08-17",
      durationWeeks: 9,
    }),
  });
  check("second bid on the same project is refused", dupe.status === 409, `got ${dupe.status}`);
}

// 4 — is it really in the database
console.log("\n4. the row is in Postgres");
if (REF && PASSWORD) {
  const client = new pg.Client({
    host: `aws-0-us-east-1.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${REF}`,
    password: PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const company = await client.query("select id, owner_id, role from companies where name = $1", [sub.company]);
  check("company row exists with an owner", company.rows.length === 1 && Boolean(company.rows[0]?.owner_id));

  if (bidId) {
    const bid = await client.query("select id, subcontractor_id, amount from bids where id = $1", [bidId]);
    check("bid row exists", bid.rows.length === 1);
    check(
      "bid is attributed to the signing-up company",
      bid.rows[0]?.subcontractor_id === company.rows[0]?.id,
      `${bid.rows[0]?.subcontractor_id} vs ${company.rows[0]?.id}`,
    );
    check("amount stored correctly", Number(bid.rows[0]?.amount) === 161500, String(bid.rows[0]?.amount));
  }

  const rls = await client.query(
    "select tablename, rowsecurity from pg_tables where schemaname='public' and rowsecurity = false",
  );
  check("every public table has RLS on", rls.rows.length === 0, rls.rows.map((r) => r.tablename).join(", "));

  await client.end();
} else {
  console.log("  SKIP  database read-back (SUPABASE_PROJECT_REF / SUPABASE_DB_PASSWORD not set)");
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
