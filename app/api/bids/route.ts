import { NextResponse } from "next/server";
import { currentCompany } from "@/lib/session-company";
import { insertAsUser } from "@/lib/supabase";

export async function POST(req: Request) {
  const me = await currentCompany();
  if (!me) {
    return NextResponse.json({ error: "Sign in to bid." }, { status: 401 });
  }
  if (me.role !== "subcontractor") {
    return NextResponse.json({ error: "Only subcontractors submit bids." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    projectId?: string;
    amount?: number;
    crewSize?: number;
    startAvailable?: string;
    durationWeeks?: number;
    note?: string;
  };

  const amount = Number(body.amount);
  if (!body.projectId || !amount || amount <= 0 || !body.startAvailable) {
    return NextResponse.json({ error: "A price and a start date are both required." }, { status: 400 });
  }

  const id = `bid-${Date.now().toString(36)}-${me.companyId.slice(0, 6)}`;

  // subcontractor_id is taken from the session, never from the request body —
  // and the RLS insert policy checks it again on the way in.
  const result = await insertAsUser<{ id: string }>(
    "bids",
    {
      id,
      project_id: body.projectId,
      subcontractor_id: me.companyId,
      amount: Math.round(amount),
      crew_size: Number(body.crewSize) || 1,
      start_available: body.startAvailable,
      duration_weeks: Number(body.durationWeeks) || 1,
      note: body.note ?? "",
      status: "submitted",
    },
    me.session.accessToken,
  );

  if (!result.ok) {
    // A duplicate is the common case: one bid per company per project.
    const duplicate = /duplicate key|unique constraint/i.test(result.error);
    return NextResponse.json(
      { error: duplicate ? "You have already bid on this project — revise that bid instead." : result.error },
      { status: duplicate ? 409 : 400 },
    );
  }

  return NextResponse.json({ ok: true, id });
}
