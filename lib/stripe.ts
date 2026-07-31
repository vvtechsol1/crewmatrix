/**
 * Stripe over plain HTTP.
 *
 * Two different Stripe products are in play on a marketplace and they are easy
 * to conflate:
 *
 *   Billing  — the monthly subscription a company pays us (Checkout Session
 *              against a recurring Price).
 *   Connect  — paying a subcontractor for completed work. That needs an
 *              onboarded connected account, and transfers move money to it.
 *
 * Both are implemented here as form-encoded REST calls so the worker bundle
 * stays small and cold starts stay fast.
 */

const API = "https://api.stripe.com/v1";

const secret = () => process.env.STRIPE_SECRET_KEY ?? "";

export function stripeConfigured(): boolean {
  return secret().startsWith("sk_");
}

/** Stripe's API is form-encoded, including nested keys like line_items[0][price]. */
function encode(data: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) params.append(k, String(v));
  }
  return params.toString();
}

async function call<T>(path: string, body: Record<string, string | number | undefined>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encode(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Stripe ${path} failed: ${res.status} ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export async function createCheckoutSession(opts: {
  priceId: string;
  origin: string;
  customerEmail?: string;
}): Promise<{ id: string; url: string }> {
  return call("/checkout/sessions", {
    mode: "subscription",
    "line_items[0][price]": opts.priceId,
    "line_items[0][quantity]": 1,
    success_url: `${opts.origin}/dashboard/sub?billing=active`,
    cancel_url: `${opts.origin}/pricing`,
    customer_email: opts.customerEmail,
    allow_promotion_codes: "true",
  });
}

/**
 * Connect onboarding. A subcontractor cannot be paid until Stripe has verified
 * identity and bank details, so this link is generated per account and expires.
 */
export async function createConnectAccount(email: string): Promise<{ id: string }> {
  return call("/accounts", {
    type: "express",
    email,
    "capabilities[transfers][requested]": "true",
    business_type: "company",
  });
}

export async function createAccountLink(accountId: string, origin: string): Promise<{ url: string }> {
  return call("/account_links", {
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${origin}/dashboard/sub?connect=retry`,
    return_url: `${origin}/dashboard/sub?connect=done`,
  });
}

/**
 * Milestone release. The platform fee is taken here rather than at award time,
 * so a job that never runs never charges anybody.
 */
export async function transferToSub(opts: {
  accountId: string;
  amountCents: number;
  projectId: string;
}): Promise<{ id: string }> {
  return call("/transfers", {
    amount: opts.amountCents,
    currency: "usd",
    destination: opts.accountId,
    transfer_group: opts.projectId,
    "metadata[project_id]": opts.projectId,
  });
}
