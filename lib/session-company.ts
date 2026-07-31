import { readSession, type Session } from "@/lib/auth";
import { selectAsUser } from "@/lib/supabase";

export interface SessionCompany {
  session: Session;
  companyId: string;
  role: "contractor" | "subcontractor";
  name: string;
}

/**
 * Resolve the signed-in user to the company they act for.
 *
 * This is the application-side mirror of the `current_company_id()` function in
 * Postgres. The database is still the authority — this only saves us a round
 * trip when we need the id to build a row.
 */
export async function currentCompany(): Promise<SessionCompany | null> {
  const session = await readSession();
  if (!session) return null;

  const rows = await selectAsUser<{ id: string; role: "contractor" | "subcontractor"; name: string }>(
    "companies",
    `select=id,role,name&owner_id=eq.${session.userId}&limit=1`,
    session.accessToken,
  );

  const company = rows[0];
  if (!company) return null;

  return { session, companyId: company.id, role: company.role, name: company.name };
}
