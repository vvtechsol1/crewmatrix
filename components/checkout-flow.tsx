"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { Button, Field, Input, Select, Steps } from "@/components/form";

type PlanId = "pro" | "crew";

const PLANS: Record<PlanId, { name: string; monthly: number; yearly: number; forRole: string; features: string[] }> = {
  pro: {
    name: "Pro",
    monthly: 79,
    yearly: 790,
    forRole: "Subcontractors",
    features: [
      "Unlimited bids",
      "12-hour early access to new work",
      "Match alerts by trade and radius",
      "Bid analytics — win rate and price position",
      "Priority payout release",
    ],
  },
  crew: {
    name: "Crew",
    monthly: 149,
    yearly: 1490,
    forRole: "General contractors",
    features: [
      "Unlimited project posts",
      "Private invite lists and preferred crews",
      "Side-by-side bid comparison",
      "Compliance tracking on licence and insurance expiry",
      "Escrow and milestone payouts",
    ],
  },
};

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export function CheckoutFlow() {
  const params = useSearchParams();
  const planId: PlanId = params.get("plan") === "crew" ? "crew" : "pro";
  const plan = PLANS[planId];

  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [billing, setBilling] = useState({
    company: "",
    email: "",
    line1: "",
    city: "",
    state: "CO",
    zip: "",
    vat: "",
  });

  const price = cycle === "monthly" ? plan.monthly : plan.yearly;
  const perMonth = cycle === "monthly" ? plan.monthly : Math.round(plan.yearly / 12);
  const saving = plan.monthly * 12 - plan.yearly;

  function validate() {
    const e: Record<string, string> = {};
    if (billing.company.trim().length < 2) e.company = "Invoices need a company name.";
    if (!/^\S+@\S+\.\S+$/.test(billing.email)) e.email = "Where should receipts go?";
    if (billing.line1.trim().length < 3) e.line1 = "Required for tax purposes.";
    if (billing.city.trim().length < 2) e.city = "Required.";
    if (!/^\d{5}(-\d{4})?$/.test(billing.zip.trim())) e.zip = "Five digits.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function openSecureCheckout() {
    setCheckoutState("loading");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email: billing.email }),
      });
      const data = (await response.json()) as { url?: string };
      if (!response.ok || !data.url) {
        setCheckoutState("error");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutState("error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/pricing" className="text-sm text-ink-400 hover:text-ink-100">
        ← Back to pricing
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="mb-8">
            <Steps current={step} labels={["Billing details", "Review"]} />
          </div>

          {step === 1 && (
            <button
              onClick={() => setStep(0)}
              className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {step === 0 && (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Billing details</h1>
              <p className="mt-2 text-ink-400">This is what appears on your invoices.</p>

              <div className="mt-7 space-y-4">
                <Field label="Company name" htmlFor="co" error={errors.company}>
                  <Input
                    id="co"
                    value={billing.company}
                    placeholder="Vega Electric"
                    onChange={(e) => setBilling({ ...billing, company: e.target.value })}
                  />
                </Field>

                <Field label="Billing email" htmlFor="bemail" error={errors.email} hint="Receipts and renewal notices.">
                  <Input
                    id="bemail"
                    type="email"
                    value={billing.email}
                    placeholder="accounts@company.com"
                    onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                  />
                </Field>

                <Field label="Address" htmlFor="line1" error={errors.line1}>
                  <Input
                    id="line1"
                    value={billing.line1}
                    placeholder="1420 Blake Street, Suite 300"
                    onChange={(e) => setBilling({ ...billing, line1: e.target.value })}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-[1fr_6rem_8rem]">
                  <Field label="City" htmlFor="bcity" error={errors.city}>
                    <Input
                      id="bcity"
                      value={billing.city}
                      placeholder="Denver"
                      onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                    />
                  </Field>
                  <Field label="State" htmlFor="bstate">
                    <Select
                      id="bstate"
                      value={billing.state}
                      onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                    >
                      {["CO", "AZ", "NM", "UT", "TX", "WY"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="ZIP" htmlFor="zip" error={errors.zip}>
                    <Input
                      id="zip"
                      inputMode="numeric"
                      value={billing.zip}
                      placeholder="80202"
                      onChange={(e) => setBilling({ ...billing, zip: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Tax ID" htmlFor="vat" hint="Optional. Appears on the invoice if supplied.">
                  <Input
                    id="vat"
                    value={billing.vat}
                    onChange={(e) => setBilling({ ...billing, vat: e.target.value })}
                  />
                </Field>
              </div>

              <Button onClick={() => validate() && setStep(1)} className="mt-8 w-full sm:w-auto">
                Continue to review
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Confirm your subscription</h1>
              <p className="mt-2 text-ink-400">
                Nothing is charged until you confirm, and you can cancel from settings without contacting anyone.
              </p>

              <dl className="mt-7 divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900">
                <Row label="Plan" value={`${plan.name} · ${plan.forRole}`} />
                <Row label="Billing" value={cycle === "monthly" ? "Monthly" : "Yearly"} />
                <Row label="Company" value={billing.company} />
                <Row label="Email" value={billing.email} />
                <Row
                  label="Address"
                  value={`${billing.line1}, ${billing.city}, ${billing.state} ${billing.zip}`}
                />
                {billing.vat && <Row label="Tax ID" value={billing.vat} />}
                <Row label="Total today" value={money(price)} />
              </dl>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-900 p-5">
                <Lock size={17} className="mt-0.5 shrink-0 text-ink-400" />
                <p className="text-sm leading-relaxed text-ink-400">
                  Card details are entered on our payment provider&apos;s own secure page and never touch CrewMatrix
                  servers. Confirming takes you there.
                </p>
              </div>

              {checkoutState === "error" && (
                <p role="alert" className="mt-5 text-sm font-medium text-warn-500">
                  Secure checkout is temporarily unavailable. No charge was made.
                </p>
              )}
              <Button
                onClick={openSecureCheckout}
                disabled={checkoutState === "loading"}
                className="mt-7 w-full sm:w-auto"
              >
                {checkoutState === "loading" ? "Opening secure checkout…" : "Confirm and subscribe"}
              </Button>
            </>
          )}
        </div>

        {/* order summary sticks with you through both steps */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
            <div className="text-xs uppercase tracking-wide text-ink-400">Your plan</div>
            <div className="mt-1.5 text-xl font-semibold tracking-tight">{plan.name}</div>
            <div className="text-sm text-ink-400">{plan.forRole}</div>

            <div className="mt-5 inline-flex w-full rounded-lg border border-ink-800 bg-ink-950 p-1">
              {(["monthly", "yearly"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={clsx(
                    "min-h-11 flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    cycle === c ? "bg-hi-500 text-ink-950" : "text-ink-400 hover:text-ink-100",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">{money(price)}</span>
              <span className="text-sm text-ink-400">/{cycle === "monthly" ? "month" : "year"}</span>
            </div>
            {cycle === "yearly" && (
              <div className="mt-1 text-xs text-ok-500">
                {money(perMonth)}/month — you keep {money(saving)}
              </div>
            )}

            <ul className="mt-5 space-y-2 border-t border-ink-800 pt-5">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-ink-300">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-ok-500" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-2 border-t border-ink-800 pt-4 text-xs text-ink-400">
              <ShieldCheck size={14} className="text-ok-500" />
              Cancel any time — no call, no retention queue
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 px-5 py-3.5">
      <dt className="w-32 shrink-0 text-sm text-ink-400">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm">{value}</dd>
    </div>
  );
}
