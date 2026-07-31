/**
 * Minimal PostgREST client for Supabase.
 *
 * Deliberately dependency-free: Supabase's REST surface is plain HTTP, and on
 * a Cloudflare Worker a fetch wrapper starts faster and ships smaller than the
 * full SDK. The auth model is the part that matters and it is unchanged — we
 * pass the caller's JWT through as a Bearer token so every query is evaluated
 * against the row-level security policies in supabase/schema.sql rather than
 * being filtered in application code.
 */

const url = () => process.env.SUPABASE_URL ?? "";
const anonKey = () => process.env.SUPABASE_ANON_KEY ?? "";

export function supabaseConfigured(): boolean {
  return Boolean(url() && anonKey());
}

/**
 * @param table    PostgREST table name
 * @param query    raw query string, e.g. "status=eq.open&order=posted_at.desc"
 * @param jwt      the signed-in user's access token; without it the request is
 *                 evaluated as the `anon` role, which the policies restrict to
 *                 published rows only
 */
export async function fromSupabase<T>(table: string, query?: string, jwt?: string): Promise<T[] | null> {
  if (!supabaseConfigured()) return null;

  const endpoint = `${url()}/rest/v1/${table}${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: anonKey(),
        Authorization: `Bearer ${jwt ?? anonKey()}`,
        Accept: "application/json",
      },
      // marketplace listings change often enough that a short window is right
      next: { revalidate: 30 },
    });

    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch {
    // A marketplace that 500s because Postgres blinked is worse than one that
    // serves slightly stale data, so callers fall back to the last known set.
    return null;
  }
}

/**
 * Insert rows as the signed-in user.
 *
 * The caller's JWT goes through as the Bearer token, so the insert is evaluated
 * against the RLS policies — a subcontractor physically cannot write a bid in
 * someone else's name, whatever the request body says.
 */
export async function insertAsUser<T>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
  jwt: string,
): Promise<{ ok: true; data: T[] } | { ok: false; error: string }> {
  if (!supabaseConfigured()) return { ok: false, error: "Database is not configured." };

  try {
    const res = await fetch(`${url()}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: anonKey(),
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(rows),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = (json as { message?: string } | null)?.message ?? `insert failed (${res.status})`;
      return { ok: false, error: detail };
    }
    return { ok: true, data: (json ?? []) as T[] };
  } catch {
    return { ok: false, error: "Could not reach the database." };
  }
}

/** Read as the signed-in user, so RLS decides what comes back. */
export async function selectAsUser<T>(table: string, query: string, jwt: string): Promise<T[]> {
  const rows = await fromSupabase<T>(table, query, jwt);
  return rows ?? [];
}
