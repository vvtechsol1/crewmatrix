import { NextResponse } from "next/server";
import { currentCompany } from "@/lib/session-company";
import { insertAsUser } from "@/lib/supabase";

export async function POST(req: Request) {
  const me = await currentCompany();
  if (!me) {
    return NextResponse.json({ error: "Sign in to post a project." }, { status: 401 });
  }
  if (me.role !== "contractor") {
    return NextResponse.json({ error: "Only general contractors post projects." }, { status: 403 });
  }

  const b = (await req.json().catch(() => ({}))) as {
    title?: string;
    trade?: string;
    city?: string;
    state?: string;
    scope?: string;
    requirements?: string[];
    budgetLow?: number;
    budgetHigh?: number;
    startDate?: string;
    durationWeeks?: number;
  };

  const low = Number(b.budgetLow);
  const high = Number(b.budgetHigh);

  if (!b.title || !b.trade || !b.city || !b.scope || !low || !high || !b.startDate) {
    return NextResponse.json({ error: "Some required details are missing." }, { status: 400 });
  }
  if (high < low) {
    return NextResponse.json({ error: "The top of the budget range is below the bottom." }, { status: 400 });
  }

  const id = `prj-${Date.now().toString(36)}`;

  const result = await insertAsUser<{ id: string }>(
    "projects",
    {
      id,
      contractor_id: me.companyId,
      title: b.title,
      trade: b.trade,
      city: b.city,
      state: b.state ?? "CO",
      distance_miles: 0,
      budget_low: Math.round(low),
      budget_high: Math.round(high),
      start_date: b.startDate,
      duration_weeks: Number(b.durationWeeks) || 1,
      status: "open",
      scope: b.scope,
      requirements: b.requirements ?? [],
      bid_count: 0,
      platform_fee_pct: 4.0,
    },
    me.session.accessToken,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id });
}
