import type { Metadata } from "next";
import { Card, Pill } from "@/components/ui";
import { InviteTeammate } from "@/components/invite-teammate";

export const metadata: Metadata = { title: "Team — CrewMatrix" };

const members = [
  { name: "Luis Vega", email: "luis@vegaelectric.com", role: "Owner", initials: "LV", accent: "#f2a33c" },
  { name: "Marta Vega", email: "marta@vegaelectric.com", role: "Estimator", initials: "MV", accent: "#5aa9e6" },
  { name: "Ben Okoro", email: "ben@vegaelectric.com", role: "Field lead", initials: "BO", accent: "#3fae7a" },
];

const roles = [
  { name: "Owner", can: "Everything, including billing, payouts and removing people." },
  { name: "Estimator", can: "Submit and revise bids, message contractors. Cannot touch billing or payouts." },
  { name: "Field lead", can: "Read projects and messages. Cannot bid or change anything." },
];

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h2 className="font-medium">Who can act on this account</h2>
            <p className="mt-1.5 text-sm text-ink-400">
              Bids are commitments, so only the roles below can submit one.
            </p>
          </div>
          <InviteTeammate />
        </div>

        <ul className="divide-y divide-ink-800 border-t border-ink-800">
          {members.map((m) => (
            <li key={m.email} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold text-ink-950"
                style={{ background: m.accent }}
              >
                {m.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{m.name}</div>
                <div className="truncate text-sm text-ink-400">{m.email}</div>
              </div>
              <Pill tone={m.role === "Owner" ? "accent" : "neutral"}>{m.role}</Pill>
              {m.role !== "Owner" && (
                <button className="text-sm text-ink-400 hover:text-bad-500">Remove</button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="font-medium">What each role can do</h2>
        <dl className="mt-4 space-y-3">
          {roles.map((r) => (
            <div key={r.name} className="flex flex-wrap gap-x-6 gap-y-1">
              <dt className="w-28 shrink-0 text-sm font-medium">{r.name}</dt>
              <dd className="min-w-0 flex-1 text-sm leading-relaxed text-ink-400">{r.can}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 border-t border-ink-800 pt-4 text-xs leading-relaxed text-ink-400">
          Roles are enforced in the database, not only in the interface — a field lead cannot submit a bid even by
          calling the API directly.
        </p>
      </Card>
    </div>
  );
}
