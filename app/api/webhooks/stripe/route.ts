import { NextResponse } from "next/server";

/**
 * Stripe webhook receiver.
 *
 * The signature check is done with Web Crypto rather than the Node SDK so the
 * same code runs on a Cloudflare Worker. Skipping verification would let anyone
 * who learns the URL mark invoices paid, so an unverified request is rejected
 * before the body is looked at.
 */

const TOLERANCE_SECONDS = 300;

async function verify(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k.trim(), v];
    }),
  ) as { t?: string; v1?: string };

  if (!parts.t || !parts.v1) return false;

  // Reject replays of an old, legitimately-signed payload.
  const age = Math.floor(Date.now() / 1000) - Number(parts.t);
  if (!Number.isFinite(age) || Math.abs(age) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parts.t}.${payload}`));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare — a length check alone leaks nothing useful, but an
  // early-exit compare would.
  if (expected.length !== parts.v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!secret) {
    return NextResponse.json({ reason: "webhook_not_configured" }, { status: 503 });
  }

  const payload = await req.text();
  const ok = await verify(payload, req.headers.get("stripe-signature"), secret);
  if (!ok) {
    return NextResponse.json({ reason: "bad_signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };

  switch (event.type) {
    case "checkout.session.completed":
      // Subscription started — raise the company's plan tier.
      break;
    case "customer.subscription.deleted":
      // Downgrade to Starter at period end rather than cutting access mid-job.
      break;
    case "account.updated":
      // Connect onboarding finished; the account can now receive transfers.
      break;
    case "transfer.paid":
      // Milestone released — flip the payout row to paid.
      break;
    default:
      break;
  }

  // Always 200 on a verified event. Anything else makes Stripe retry a message
  // we already accepted.
  return NextResponse.json({ received: true });
}
