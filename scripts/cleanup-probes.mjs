/** Removes the throwaway accounts the verification script creates. */
import pg from "pg";

const client = new pg.Client({
  host: "aws-0-us-east-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${process.env.SUPABASE_PROJECT_REF}`,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const before = await client.query("select count(*)::int as n from auth.users");
const companies = await client.query(
  "delete from companies where name like 'Verify Electric%' returning id",
);
const users = await client.query(
  "delete from auth.users where email like 'probe%' or email like 'cl.probe%' or email like 'CrewMatrix.check%' returning email",
);
const after = await client.query("select count(*)::int as n from auth.users");
const co = await client.query("select count(*)::int as n from companies");

console.log(`auth users before : ${before.rows[0].n}`);
console.log(`probe users deleted: ${users.rowCount}`);
console.log(`probe companies deleted: ${companies.rowCount}`);
console.log(`auth users now    : ${after.rows[0].n}`);
console.log(`companies now     : ${co.rows[0].n}`);

await client.end();
