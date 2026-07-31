import { cookies } from "next/headers";

/**
 * Supabase Auth over its REST endpoints.
 *
 * No SDK: the auth API is plain HTTP, and doing it by hand keeps the Worker
 * bundle small and makes the session model explicit. The access token is a JWT
 * signed by Supabase; every database read we make on behalf of a user passes it
 * through as a Bearer token so the row-level security policies in
 * supabase/schema.sql are what decide access — not our own `if` statements.
 */

const SESSION_COOKIE = "cl_session";

export const supabaseUrl = () => process.env.SUPABASE_URL ?? "";
export const anonKey = () => process.env.SUPABASE_ANON_KEY ?? "";

export function authConfigured(): boolean {
  return Boolean(supabaseUrl() && anonKey());
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  expiresAt: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email: string };
}

async function authFetch<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${supabaseUrl()}/auth/v1${path}`, {
      method: "POST",
      headers: {
        apikey: anonKey(),
        Authorization: `Bearer ${anonKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = (await res.json()) as T & { msg?: string; error_description?: string; message?: string };

    if (!res.ok) {
      return {
        ok: false,
        error: json.error_description ?? json.msg ?? json.message ?? `Sign-in failed (${res.status})`,
      };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "Could not reach the authentication service." };
  }
}

export async function signUp(
  email: string,
  password: string,
  meta: Record<string, unknown> = {},
  redirectTo?: string,
) {
  const path = redirectTo ? `/signup?redirect_to=${encodeURIComponent(redirectTo)}` : "/signup";
  return authFetch<TokenResponse>(path, { email, password, data: meta });
}

export async function signIn(email: string, password: string) {
  return authFetch<TokenResponse>("/token?grant_type=password", { email, password });
}

export async function refresh(refreshToken: string) {
  return authFetch<TokenResponse>("/token?grant_type=refresh_token", { refresh_token: refreshToken });
}

/** Session lives in an httpOnly cookie so page scripts can never read the JWT. */
export async function writeSession(t: TokenResponse) {
  const store = await cookies();
  const session: Session = {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    userId: t.user.id,
    email: t.user.email,
    expiresAt: Date.now() + t.expires_in * 1000,
  };

  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function readSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    return s.accessToken ? s : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const sessionCookieName = SESSION_COOKIE;
