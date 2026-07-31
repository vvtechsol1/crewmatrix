/**
 * Applies supabase/schema.sql then supabase/seed.sql to the project database.
 *
 *   node scripts/migrate.mjs
 *
 * Reads SUPABASE_DB_PASSWORD and SUPABASE_PROJECT_REF from the environment.
 * Supabase's direct host is IPv6-only on new projects, so we fall back to the
 * session pooler, which is IPv4 and still supports DDL.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const REF = process.env.SUPABASE_PROJECT_REF;
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const REGION = process.env.SUPABASE_REGION ?? "us-east-1";

if (!REF || !PASSWORD) {
  console.error("Set SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD.");
  process.exit(1);
}

const candidates = [
  {
    label: "session pooler (IPv4)",
    host: `aws-0-${REGION}.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${REF}`,
  },
  {
    label: "direct",
    host: `db.${REF}.supabase.co`,
    port: 5432,
    user: "postgres",
  },
];

async function connect() {
  let lastError;
  for (const c of candidates) {
    const client = new pg.Client({
      host: c.host,
      port: c.port,
      user: c.user,
      password: PASSWORD,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15_000,
    });
    try {
      await client.connect();
      console.log(`connected via ${c.label} — ${c.host}`);
      return client;
    } catch (err) {
      console.log(`  ${c.label} failed: ${err.message}`);
      lastError = err;
      try {
        await client.end();
      } catch {}
    }
  }
  throw lastError;
}

async function run(client, file, { tolerateExisting = false } = {}) {
  const sql = readFileSync(join(root, "supabase", file), "utf8");
  console.log(`\napplying ${file} (${sql.length} chars)…`);
  try {
    await client.query(sql);
    console.log(`  ${file} applied`);
  } catch (err) {
    // "already exists" on a re-run is not a failure worth stopping for.
    if (tolerateExisting && /already exists/i.test(err.message)) {
      console.log(`  ${file}: objects already present — ${err.message.split("\n")[0]}`);
      return;
    }
    throw err;
  }
}

const client = await connect();

try {
  await run(client, "schema.sql", { tolerateExisting: true });
  await run(client, "seed.sql");

  const counts = await client.query(`
    select 'companies' as t, count(*) from companies
    union all select 'projects', count(*) from projects
    union all select 'bids',     count(*) from bids
    union all select 'messages', count(*) from messages
    union all select 'payouts',  count(*) from payouts
    order by 1
  `);
  console.log("\nrow counts:");
  for (const r of counts.rows) console.log(`  ${r.t.padEnd(10)} ${r.count}`);

  const rls = await client.query(`
    select tablename, rowsecurity
    from pg_tables where schemaname = 'public' order by tablename
  `);
  console.log("\nrow-level security:");
  for (const r of rls.rows) console.log(`  ${r.tablename.padEnd(10)} ${r.rowsecurity ? "enabled" : "OFF"}`);

  const policies = await client.query(
    `select tablename, count(*) from pg_policies where schemaname='public' group by 1 order by 1`,
  );
  console.log("\npolicies:");
  for (const r of policies.rows) console.log(`  ${r.tablename.padEnd(10)} ${r.count}`);
} finally {
  await client.end();
}
