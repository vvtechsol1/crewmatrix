import Link from "next/link";
import clsx from "clsx";
import {
  ArrowRight,
  Building2,
  Check,
  HardHat,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Side = "contractor" | "subcontractor";
type Plan = {
  name: string;
  price: number;
  blurb: string;
  features: string[];
  featured?: boolean;
};

const plans: Record<Side, Plan[]> = {
  contractor: [
    {
      name: "Starter",
      price: 0,
      blurb: "Try CrewMatrix on one active job.",
      features: ["Company profile", "One open project", "Browse subcontractors", "Basic messaging"],
    },
    {
      name: "Crew",
      price: 149,
      blurb: "For contractors running multiple jobs and a trusted bench of subs.",
      features: [
        "Unlimited project posts",
        "Private invite lists and preferred crews",
        "Side-by-side bid comparison",
        "Compliance tracking on expiry dates",
        "Escrow and milestone payouts",
      ],
      featured: true,
    },
  ],
  subcontractor: [
    {
      name: "Starter",
      price: 0,
      blurb: "Get listed and win your first job.",
      features: ["Verified company profile", "Browse every open project", "3 bids per month", "In-project messaging"],
    },
    {
      name: "Pro",
      price: 79,
      blurb: "For crews that live on the marketplace and need to move first.",
      features: [
        "Unlimited bids",
        "12-hour early access to new work",
        "Match alerts by trade and radius",
        "Bid analytics — win rate and price position",
        "Priority payout release",
      ],
      featured: true,
    },
  ],
};

export function PricingPreview() {
  return (
    <div className="pricing-role-switch relative">
      <style>{`
        .pricing-role-switch .pricing-role-input {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
        }
        .pricing-role-switch .pricing-tablist { width: fit-content; }
        .pricing-role-switch .pricing-role-tab {
          color: var(--color-ink-400);
          user-select: none;
        }
        .pricing-role-switch .pricing-plan-set { display: none; }
        #pricing-contractor:checked ~ .pricing-tablist label[for="pricing-contractor"],
        #pricing-subcontractor:checked ~ .pricing-tablist label[for="pricing-subcontractor"] {
          color: #fff;
          background: var(--color-hi-500);
          box-shadow: 0 8px 20px rgb(38 73 216 / 25%);
        }
        #pricing-contractor:checked ~ .pricing-plan-sets .pricing-contractor-plans,
        #pricing-subcontractor:checked ~ .pricing-plan-sets .pricing-subcontractor-plans {
          display: grid;
        }
        #pricing-contractor:focus-visible ~ .pricing-tablist label[for="pricing-contractor"],
        #pricing-subcontractor:focus-visible ~ .pricing-tablist label[for="pricing-subcontractor"] {
          outline: 3px solid rgb(38 73 216 / 55%);
          outline-offset: 3px;
        }
      `}</style>
      <input className="pricing-role-input" type="radio" name="pricing-role" id="pricing-contractor" defaultChecked />
      <input className="pricing-role-input" type="radio" name="pricing-role" id="pricing-subcontractor" />

      <div className="pricing-tablist mx-auto flex rounded-2xl border border-ink-800 bg-white p-1.5 shadow-[0_12px_40px_rgba(14,27,51,.08)]">
        <label
          htmlFor="pricing-contractor"
          className="pricing-role-tab flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-6"
        >
          <Building2 size={16} />
          General contractor
        </label>
        <label
          htmlFor="pricing-subcontractor"
          className="pricing-role-tab flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-6"
        >
          <HardHat size={16} />
          Subcontractor
        </label>
      </div>

      <div className="pricing-plan-sets">
        {(["contractor", "subcontractor"] as Side[]).map((planSide) => (
          <div
            key={planSide}
            className={clsx(
              "pricing-plan-set mx-auto mt-8 max-w-5xl gap-5 lg:grid-cols-[.9fr_1.1fr]",
              planSide === "contractor" ? "pricing-contractor-plans" : "pricing-subcontractor-plans",
            )}
          >
            {plans[planSide].map((plan) => (
          <article
            key={plan.name}
            style={{
              borderRadius: 28,
              background: plan.featured
                ? "linear-gradient(145deg, #17309c 0%, #10266f 55%, #0b1d55 100%)"
                : "#ffffff",
            }}
            className={clsx(
              "pricing-card group relative flex min-h-[440px] flex-col overflow-hidden rounded-[28px] border p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8",
              plan.featured
                ? "border-hi-500 text-white shadow-[0_28px_70px_rgba(23,48,156,.25)]"
                : "border-ink-800 text-ink-100 shadow-[0_18px_55px_rgba(14,27,51,.08)]",
            )}
          >
            {plan.featured ? (
              <>
                <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-hi-500/30 blur-3xl" />
              </>
            ) : null}

            <div className="relative flex items-center justify-between">
              <div
                className={clsx(
                  "grid size-11 place-items-center rounded-2xl",
                  plan.featured ? "bg-white/10 text-[#ffd15c]" : "bg-hi-500/10 text-hi-500",
                )}
              >
                {plan.featured ? <Sparkles size={20} /> : <ShieldCheck size={20} />}
              </div>
              {plan.featured ? (
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#ffd15c] backdrop-blur">
                  Most chosen
                </span>
              ) : null}
            </div>

            <div className="relative mt-7">
              <h3 className={clsx("text-lg font-bold", plan.featured ? "text-white" : "text-ink-100")}>
                {plan.name}
              </h3>
              <div className="mt-2 flex items-end gap-1.5">
                <span className="pricing-price text-5xl font-black tracking-[-.05em]">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price > 0 ? (
                  <span className={clsx("pb-1.5 text-sm", plan.featured ? "text-white/60" : "text-ink-400")}>
                    /month
                  </span>
                ) : null}
              </div>
            </div>

            <p className={clsx("relative mt-3 min-h-10 text-sm leading-6", plan.featured ? "text-white/70" : "text-ink-400")}>
              {plan.blurb}
            </p>

            <div className={clsx("relative my-6 h-px", plan.featured ? "bg-white/15" : "bg-ink-800")} />

            <ul className="relative flex-1 space-y-3.5">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className={clsx("flex gap-3 text-sm leading-5", plan.featured ? "text-white/85" : "text-ink-300")}
                >
                  <span
                    className={clsx(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                      plan.featured ? "bg-[#ffd15c]/15 text-[#ffd15c]" : "bg-ok-500/10 text-ok-500",
                    )}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={plan.price === 0 ? "/signup" : `/checkout?plan=${plan.name.toLowerCase()}`}
              className={clsx(
                "relative mt-8 flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hi-500 focus-visible:ring-offset-2",
                plan.featured
                  ? "bg-[#ffc43d] text-[#0e1b33] shadow-[0_12px_28px_rgba(255,196,61,.2)] hover:bg-[#ffd15c]"
                  : "border border-ink-700 bg-ink-900 text-ink-100 hover:border-hi-500 hover:bg-hi-500 hover:text-white",
              )}
            >
              <span>{plan.price === 0 ? "Start free" : `Choose ${plan.name}`}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
              </article>
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-7 flex max-w-5xl flex-col items-center justify-between gap-4 rounded-2xl border border-ink-800 bg-white/70 px-5 py-4 text-sm text-ink-400 backdrop-blur sm:flex-row">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
          <span className="flex items-center gap-2"><Check size={15} className="text-ok-500" />No lead fees</span>
          <span className="flex items-center gap-2"><Check size={15} className="text-ok-500" />Cancel anytime</span>
          <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-ok-500" />Secure payouts</span>
        </div>
        <Link href="/pricing" className="flex shrink-0 items-center gap-1.5 font-semibold text-hi-500 hover:text-hi-400">
          Compare all features <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
