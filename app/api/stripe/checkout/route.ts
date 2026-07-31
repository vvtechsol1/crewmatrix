import { NextResponse } from "next/server";
import { listPlans } from "@/lib/db";
import { createCheckoutSession, stripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  const { plan: planId, email } = (await req.json().catch(() => ({}))) as {
    plan?: string;
    email?: string;
  };

  const plan = listPlans().find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ reason: "unknown_plan" }, { status: 400 });
  }
  if (plan.priceMonthly === 0) {
    return NextResponse.json({ url: "/find-work" });
  }

  // Price IDs are environment configuration, never source. A missing key is a
  // deployment state, not an error the visitor caused.
  const priceId = process.env[plan.priceEnvKey];
  if (!stripeConfigured() || !priceId) {
    return NextResponse.json({ reason: "billing_not_configured" }, { status: 503 });
  }

  try {
    const origin = new URL(req.url).origin;
    const session = await createCheckoutSession({ priceId, origin, customerEmail: email });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ reason: "stripe_error" }, { status: 502 });
  }
}
