import { NextResponse } from "next/server";
import { anonKey, authConfigured, supabaseUrl } from "@/lib/auth";

type AuthError = { error_description?: string; msg?: string; message?: string };

export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Email authentication is not configured." }, { status: 503 });
  }

  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const redirectTo = new URL("/reset-password", req.url).toString();
  try {
    const response = await fetch(
      `${supabaseUrl()}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,
      {
        method: "POST",
        headers: {
          apikey: anonKey(),
          Authorization: `Bearer ${anonKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json({ error: "The reset email could not be sent." }, { status: 502 });
    }

    // Keep this response identical whether or not the address exists.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The email service is unavailable." }, { status: 502 });
  }
}

export async function PUT(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Email authentication is not configured." }, { status: 503 });
  }

  const { accessToken, password } = (await req.json().catch(() => ({}))) as {
    accessToken?: string;
    password?: string;
  };
  if (!accessToken || !password) {
    return NextResponse.json({ error: "The reset link is incomplete." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
  }

  try {
    const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: anonKey(),
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = (await response.json().catch(() => ({}))) as AuthError;
      const message = detail.error_description ?? detail.msg ?? detail.message ?? "The reset link is invalid or expired.";
      return NextResponse.json({ error: message }, { status: response.status === 422 ? 422 : 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The authentication service is unavailable." }, { status: 502 });
  }
}
