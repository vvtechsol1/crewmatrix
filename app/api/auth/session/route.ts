import { NextResponse } from "next/server";
import { anonKey, authConfigured, supabaseUrl, writeSession } from "@/lib/auth";

/**
 * Completes an OAuth sign-in.
 *
 * The provider round trip returns tokens in the URL fragment, which only the
 * browser can read, so the callback page posts them here. We do not trust them
 * on sight — the token is checked against Supabase before any cookie is set,
 * otherwise anyone could post a made-up JWT and get a session cookie for it.
 */
export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const { access_token, refresh_token, expires_in } = (await req.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens." }, { status: 400 });
  }

  const check = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: { apikey: anonKey(), Authorization: `Bearer ${access_token}` },
    cache: "no-store",
  });

  if (!check.ok) {
    return NextResponse.json({ error: "That token is not valid." }, { status: 401 });
  }

  const user = (await check.json()) as { id: string; email: string };

  await writeSession({
    access_token,
    refresh_token,
    expires_in: expires_in ?? 3600,
    user: { id: user.id, email: user.email },
  });

  return NextResponse.json({ ok: true });
}
