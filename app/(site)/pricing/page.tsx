import type { Metadata } from "next";
import { Check } from "lucide-react";
import clsx from "clsx";
import { listPlans } from "@/lib/db";
import { Card, SectionHead } from "@/components/ui";
import { PlanButton } from "@/components/plan-button";

export const metadata: Metadata = {
  title: "Pricing — CrewMatrix",
  description: "Free to list and bid. Paid tiers for crews and contractors who live on the marketplace.",
};

const faqs = [
  {
    q: "What does the platform fee cover?",
    a: "A 4% fee applies to the awarded amount when payment runs through the platform. It covers payment processing, escrow handling and dispute support. Work agreed and paid outside the platform carries no fee — and no protection either.",
  },
  {
    q: "How do payouts reach a subcontractor?",
    a: "Through Stripe Connect. Each subcontractor completes Stripe's onboarding once, which handles identity and bank verification. Milestone releases then transfer directly to that account.",
  },
  {
    q: "Can a general contractor and a subcontractor use one account?",
    a: "Yes. Some companies hire out and take work. The account carries both roles and each dashboard shows only the side you are working from.",
  },
  {
    q: "What happens when insurance expires mid-project?",
    a: "The badge flips on the expiry date and the contractor running the project is notified. Existing work continues; the company stops appearing under the compliance filter until a current certificate is uploaded.",
  },
];

export default function PricingPage() {
  const plans = listPlans();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <SectionHead
        as="h1"
        eyebrow="Pricing"
        title="Free to get listed. Paid when the marketplace is doing the work."
        sub="No per-bid charges and no lead fees — the plan is a subscription, and the platform fee only applies when money moves through us."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={clsx("flex flex-col p-6", p.featured && "border-hi-500/40 ring-1 ring-hi-500/20")}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{p.name}</h3>
              {p.featured && (
                <span className="rounded-md bg-hi-500/12 px-2 py-0.5 text-xs font-medium text-hi-500">
                  Most chosen
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">
                {p.priceMonthly === 0 ? "Free" : `$${p.priceMonthly}`}
              </span>
              {p.priceMonthly > 0 && <span className="text-sm text-ink-400">/month</span>}
            </div>
            {p.priceMonthly > 0 && (
              <div className="mt-1 text-xs text-ink-400">or ${p.priceYearly}/year — two months back</div>
            )}

            <p className="mt-4 text-sm leading-relaxed text-ink-400">{p.blurb}</p>

            <div className="mt-3 text-xs uppercase tracking-wide text-ink-600">
              {p.forRole === "both" ? "Either side" : p.forRole === "contractor" ? "General contractors" : "Subcontractors"}
            </div>

            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-ink-300">
                  <Check size={16} className="mt-0.5 shrink-0 text-ok-500" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <PlanButton plan={p} />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {faqs.map((f) => (
          <Card key={f.q} className="p-6">
            <div className="font-medium">{f.q}</div>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
