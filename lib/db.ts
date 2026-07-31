import { bids, companies, messages, payouts, plans, projects } from "@/data/seed";
import { fromSupabase, supabaseConfigured } from "@/lib/supabase";
import { toBid, toCompany, toMessage, toPayout, toProject } from "@/lib/map";
import type { Bid, Company, Message, Payout, PlanTier, Project, Role, Trade } from "@/lib/types";

/**
 * Single data-access layer for the whole app.
 *
 * Every read goes through here so the storage engine is one decision, not a
 * decision repeated in forty components. With SUPABASE_URL and SUPABASE_ANON_KEY
 * set we read Postgres through PostgREST; without them we serve the bundled set
 * so the marketplace is never a blank screen. Rows are mapped to the domain
 * shape in lib/map.ts, so callers cannot tell which source they got.
 *
 * Note what anonymous reads return: row-level security means a signed-out
 * visitor sees companies and open projects but no bids, no messages and no
 * payouts. That is the product working, not a bug — those belong to somebody.
 */

async function read<T>(
  table: string,
  fallback: T[],
  map: (row: Record<string, unknown>) => T,
  query?: string,
  jwt?: string,
): Promise<T[]> {
  if (!supabaseConfigured()) return fallback;
  const rows = await fromSupabase<Record<string, unknown>>(table, query, jwt);
  if (!rows) return fallback;
  return rows.map(map);
}

export async function listCompanies(role?: Role): Promise<Company[]> {
  const all = await read<Company>("companies", companies, toCompany, "select=*&order=rating.desc");
  return role ? all.filter((c) => c.role === role) : all;
}

export async function getCompany(id: string): Promise<Company | undefined> {
  const fallback = companies.filter((company) => company.id === id);
  const rows = await read<Company>(
    "companies",
    fallback,
    toCompany,
    `select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  return rows[0];
}

export interface ProjectFilter {
  trade?: Trade | "all";
  withinMiles?: number;
  minBudget?: number;
  status?: Project["status"] | "all";
  contractorId?: string;
}

export async function listProjects(filter: ProjectFilter = {}): Promise<Project[]> {
  const all = await read<Project>("projects", projects, toProject, "select=*&order=posted_at.desc");
  const { trade = "all", withinMiles, minBudget, status = "all", contractorId } = filter;

  return all
    .filter((p) => (trade === "all" ? true : p.trade === trade))
    .filter((p) => (withinMiles === undefined ? true : p.distanceMiles <= withinMiles))
    .filter((p) => (minBudget === undefined ? true : p.budgetHigh >= minBudget))
    .filter((p) => (status === "all" ? true : p.status === status))
    .filter((p) => (contractorId ? p.contractorId === contractorId : true))
    .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
}

export async function getProject(id: string): Promise<Project | undefined> {
  const fallback = projects.filter((project) => project.id === id);
  const rows = await read<Project>(
    "projects",
    fallback,
    toProject,
    `select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  return rows[0];
}

export async function listBids(
  opts: { projectId?: string; subcontractorId?: string } = {},
  jwt?: string,
): Promise<Bid[]> {
  const query = [
    "select=*",
    opts.projectId ? `project_id=eq.${encodeURIComponent(opts.projectId)}` : "",
    opts.subcontractorId ? `subcontractor_id=eq.${encodeURIComponent(opts.subcontractorId)}` : "",
  ]
    .filter(Boolean)
    .join("&");
  const all = await read<Bid>("bids", bids, toBid, query, jwt);
  return all
    .filter((b) => (opts.projectId ? b.projectId === opts.projectId : true))
    .filter((b) => (opts.subcontractorId ? b.subcontractorId === opts.subcontractorId : true))
    .sort((a, b) => a.amount - b.amount);
}

export async function listMessages(projectId: string, jwt?: string): Promise<Message[]> {
  const all = await read<Message>(
    "messages",
    messages,
    toMessage,
    `select=*&project_id=eq.${encodeURIComponent(projectId)}&order=sent_at.asc`,
    jwt,
  );
  return all.filter((m) => m.projectId === projectId);
}

export async function listPayouts(subcontractorId?: string): Promise<Payout[]> {
  const all = await read<Payout>("payouts", payouts, toPayout, "select=*");
  return subcontractorId ? all.filter((p) => p.subcontractorId === subcontractorId) : all;
}

export function listPlans(): PlanTier[] {
  return plans;
}

/** Trades that actually have work posted against them, for filter menus. */
export async function activeTrades(): Promise<Trade[]> {
  const all = await listProjects();
  return Array.from(new Set(all.map((p) => p.trade))).sort();
}

export function netOf(gross: number, feePct: number): number {
  return Math.round(gross * (1 - feePct / 100));
}
