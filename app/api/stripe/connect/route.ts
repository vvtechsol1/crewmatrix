import { NextResponse } from "next/server";
import { createAccountLink, createConnectAccount, stripeConfigured } from "@/lib/stripe";

/**
 * Starts Stripe Connect onboarding for a subcontractor.
 *
 * In production the returned account id is written to the company row so the
 * onboarding is resumed rather than restarted; that write goes through the
 * service role because RLS deliberately blocks clients from touching payout
 * plumbing.
 */
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };

  if (!stripeConfigured()) {
    return NextResponse.json({ reason: "connect_not_configured" }, { status: 503 });
  }
  if (!email) {
    return NextResponse.json({ reason: "email_required" }, { status: 400 });
  }

  try {
    const origin = new URL(req.url).origin;
    const account = await createConnectAccount(email);
    const link = await createAccountLink(account.id, origin);
    return NextResponse.json({ url: link.url, accountId: account.id });
  } catch {
    return NextResponse.json({ reason: "stripe_error" }, { status: 502 });
  }
}
