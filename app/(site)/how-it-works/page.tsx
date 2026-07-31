import type { Metadata } from "next";
import { Building2, HardHat } from "lucide-react";
import { ButtonLink, Card, SectionHead } from "@/components/ui";

export const metadata: Metadata = {
  title: "How it works — CrewMatrix",
  description: "The full walkthrough for general contractors and for subcontractors.",
};

const gc = [
  {
    n: "01",
    t: "Create the company profile",
    b: "Company name, city, the trades you hire and how far your sites spread. Two minutes, and it decides which crews get suggested to you.",
  },
  {
    n: "02",
    t: "Post a project",
    b: "Four steps: basics, scope and requirements, budget range and dates, then review. Publishing notifies every matching crew inside range straight away.",
  },
  {
    n: "03",
    t: "Compare bids honestly",
    b: "Bids land in one table — price, crew size, earliest start, and the note explaining what is in and what is out. The spread across all bids is shown so an outlier is obvious.",
  },
  {
    n: "04",
    t: "Check the paperwork before you commit",
    b: "Licence and insurance carry an expiry date. A lapsed certificate changes the badge and drops that company out of the compliance filter — you find out before the start date, not after.",
  },
  {
    n: "05",
    t: "Award and release payouts",
    b: "Award from the project page. Milestone payouts run through Stripe Connect, so the awarded amount, the platform fee and the release status stay on one chain.",
  },
];

const sub = [
  {
    n: "01",
    t: "List your crew",
    b: "Trades you genuinely self-perform, crew size, and the radius you will actually travel. Both are filters, so an honest radius earns you better matches than a hopeful one.",
  },
  {
    n: "02",
    t: "Get matched, not spammed",
    b: "Your dashboard shows open work in your trades inside your radius that you have not already bid on. Nothing else.",
  },
  {
    n: "03",
    t: "Bid with a real date",
    b: "Price, crew size, earliest honest start and a note. The form tells you where your number sits against the posted range and what you keep after the platform fee.",
  },
  {
    n: "04",
    t: "Talk on the project",
    b: "Messages attach to the project record, so a schedule question sits next to the bid it affects rather than in a separate inbox.",
  },
  {
    n: "05",
    t: "Get paid",
    b: "Stripe Connect handles identity and bank verification once. After that, milestone releases transfer straight to your account and the dashboard shows what is released and what is still held.",
  },
];

function Track({
  icon,
  title,
  sub: subtitle,
  steps,
  cta,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  steps: { n: string; t: string; b: string }[];
  cta: string;
  href: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-hi-500/12 text-hi-500">{icon}</span>
        <div>
          <h2 className="text-xl font-medium">{title}</h2>
          <p className="text-sm text-ink-400">{subtitle}</p>
        </div>
      </div>

      <ol className="mt-7 space-y-3">
        {steps.map((s) => (
          <Card key={s.n} className="flex gap-4 p-5">
            <div className="font-mono text-sm text-hi-500">{s.n}</div>
            <div>
              <div className="font-medium leading-snug">{s.t}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{s.b}</p>
            </div>
          </Card>
        ))}
      </ol>

      <ButtonLink href={href} className="mt-6">
        {cta}
      </ButtonLink>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <SectionHead
        as="h1"
        eyebrow="How it works"
        title="Both sides of the same marketplace"
        sub="One account, one record per project, and the paperwork and the money attached to it. Here is the whole path from either direction."
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-10">
        <Track
          icon={<Building2 size={19} strokeWidth={2.2} />}
          title="If you hire crews"
          sub="General contractor"
          steps={gc}
          cta="Post a project"
          href="/signup"
        />
        <Track
          icon={<HardHat size={19} strokeWidth={2.2} />}
          title="If you look for work"
          sub="Subcontractor"
          steps={sub}
          cta="Create a profile"
          href="/signup"
        />
      </div>

      <Card className="mt-16 p-8">
        <h2 className="text-xl font-medium">What happens to your data</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-ink-400">
          Bids are the most sensitive thing on a marketplace, so access is enforced in the database rather than in
          application code. A subcontractor can read only its own bids; the contractor who owns a project can read
          every bid on it; nobody else can read either. That rule lives in a row-level security policy in Postgres,
          which means it holds even if a new page forgets to check.
        </p>
      </Card>
    </div>
  );
}
