import { NextResponse } from "next/server";
import { authConfigured, signIn, writeSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Authentication is not configured on this deployment." }, { status: 503 });
  }

  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are both required." }, { status: 400 });
  }

  const result = await signIn(email, password);
  if (!result.ok) {
    // Deliberately not "no account with that email" — that tells an attacker
    // which addresses are registered.
    return NextResponse.json({ error: "Those details do not match an account." }, { status: 401 });
  }

  await writeSession(result.data);
  return NextResponse.json({ ok: true, userId: result.data.user.id });
}
