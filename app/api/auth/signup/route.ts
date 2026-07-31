import { NextResponse } from "next/server";
import { authConfigured, signUp, writeSession } from "@/lib/auth";
import { insertAsUser } from "@/lib/supabase";

/** company-name → url-safe id, with a short suffix so two "Vega Electric"s can coexist */
function companyId(name: string, userId: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return `${slug || "company"}-${userId.slice(0, 6)}`;
}

export async function POST(req: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Authentication is not configured on this deployment." }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
    company?: string;
    city?: string;
    state?: string;
    years?: string;
  };

  const { email, password, name, company, city } = body;
  const role = body.role === "contractor" ? "contractor" : "subcontractor";

  if (!email || !password || !name || !company || !city) {
    return NextResponse.json({ error: "Some required details are missing." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Passwords must be at least 8 characters." }, { status: 400 });
  }

  const callback = new URL("/auth/callback", req.url);
  callback.searchParams.set("next", `/onboarding?role=${role}`);
  const created = await signUp(email, password, { full_name: name, role }, callback.toString());
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  // Supabase returns no session when email confirmation is switched on. The
  // account exists either way — we just cannot sign them straight in.
  if (!created.data.access_token) {
    return NextResponse.json({ ok: true, confirmEmail: true });
  }

  await writeSession(created.data);

  const id = companyId(company, created.data.user.id);

  // owner_id must be the new user, which is exactly what the RLS insert policy
  // on companies checks. A forged owner_id here would simply be rejected.
  const inserted = await insertAsUser<{ id: string }>(
    "companies",
    {
      id,
      owner_id: created.data.user.id,
      role,
      name: company,
      contact: name,
      trades: [],
      city,
      state: body.state ?? "CO",
      years_in_business: Number(body.years) || 0,
    },
    created.data.access_token,
  );

  if (!inserted.ok) {
    // The account is real even if the company row failed; onboarding can retry.
    return NextResponse.json({ ok: true, companyError: inserted.error, companyId: null });
  }

  return NextResponse.json({ ok: true, companyId: id });
}
