import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getCompany, listBids, listCompanies, listProjects } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { Avatar, ButtonLink, Card, Pill, Rating, SectionHead, Stat } from "@/components/ui";

export const metadata: Metadata = { title: "Contractor dashboard — CrewMatrix" };

// The signed-in company. Wired to auth.uid() in production; fixed here so the
// workspace renders against a known account.
const ME = "gc-halloran";

export default async function ContractorDashboard() {
  const me = await getCompany(ME);
  const [mine, allCompanies] = await Promise.all([listProjects({ contractorId: ME }), listCompanies()]);
  const byId = new Map(allCompanies.map((c) => [c.id, c]));

  const bidsPerProject = await Promise.all(mine.map((p) => listBids({ projectId: p.id })));
  const allBids = bidsPerProject.flat();

  const open = mine.filter((p) => p.status === "open");
  const running = mine.filter((p) => p.status === "in_progress" || p.status === "awarded");
  const committed = mine
    .filter((p) => p.status !== "open")
    .reduce((sum, p) => sum + Math.round((p.budgetLow + p.budgetHigh) / 2), 0);

  // Compliance drift is the thing that bites a GC on a Friday afternoon.
  const lapsing = allCompanies.filter(
    (c) => c.role === "subcontractor" && (c.license.status !== "verified" || c.insurance.status !== "verified"),
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {me && <Avatar company={me} size={52} />}
          <div>
            <SectionHead eyebrow="Contractor workspace" title={me?.name ?? "Dashboard"} />
            <div className="mt-1 text-sm text-ink-400">{me?.city}, {me?.state}</div>
          </div>
        </div>
        <ButtonLink href="/find-pros">Invite a subcontractor</ButtonLink>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open projects" value={String(open.length)} hint="accepting bids now" />
        <Stat label="Bids to review" value={String(allBids.filter((b) => b.status === "submitted").length)} />
        <Stat label="Running jobs" value={String(running.length)} />
        <Stat label="Committed value" value={money(committed)} hint="awarded and in progress" />
      </div>

      {lapsing.length > 0 && (
        <Card className="mt-6 border-warn-500/30 bg-warn-500/[0.06] p-5">
          <div className="flex gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warn-500" />
            <div>
              <div className="font-medium">Compliance needs attention</div>
              <p className="mt-1 text-sm text-ink-300">
                {lapsing.length} {lapsing.length === 1 ? "company" : "companies"} on the platform have a licence or
                certificate that is not current:{" "}
                {lapsing.map((c, i) => (
                  <span key={c.id}>
                    <Link href={`/pros/${c.id}`} className="text-hi-500 hover:underline">
                      {c.name}
                    </Link>
                    {i < lapsing.length - 1 ? ", " : ""}
                  </span>
                ))}
                . They can still be messaged, but they will not appear under the compliance filter.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* projects with their bids */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your projects</h2>

        {mine.map((p, i) => {
          const bids = bidsPerProject[i];
          const low = bids.length ? Math.min(...bids.map((b) => b.amount)) : null;

          return (
            <Card key={p.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="accent">{p.trade}</Pill>
                    <Pill tone={p.status === "open" ? "ok" : "neutral"}>{p.status.replace("_", " ")}</Pill>
                  </div>
                  <h3 className="mt-2 font-medium">
                    <Link href={`/projects/${p.id}`} className="hover:text-hi-500">
                      {p.title}
                    </Link>
                  </h3>
                  <div className="mt-1 text-sm text-ink-400">
                    starts {shortDate(p.startDate)} · {p.durationWeeks} weeks · budget{" "}
                    {money(p.budgetLow)}–{money(p.budgetHigh)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-ink-400">{bids.length} bids</div>
                  {low !== null && <div className="font-medium">low {money(low)}</div>}
                </div>
              </div>

              {bids.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[38rem] text-sm">
                    <thead>
                      <tr className="border-b border-ink-800 text-left text-xs uppercase tracking-wide text-ink-400">
                        <th className="pb-2 font-medium">Subcontractor</th>
                        <th className="pb-2 font-medium">Crew</th>
                        <th className="pb-2 font-medium">Can start</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-800">
                      {bids.map((b) => {
                        const sub = byId.get(b.subcontractorId);
                        return (
                          <tr key={b.id}>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                {sub && <Avatar company={sub} size={26} />}
                                <div className="min-w-0">
                                  <div className="truncate">{sub?.name ?? "—"}</div>
                                  {sub && <Rating value={sub.rating} count={sub.reviewCount} />}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-ink-300">{b.crewSize}</td>
                            <td className="py-2.5 text-ink-300">{shortDate(b.startAvailable)}</td>
                            <td className="py-2.5">
                              <Pill tone={b.status === "awarded" ? "ok" : b.status === "shortlisted" ? "warn" : "neutral"}>
                                {b.status}
                              </Pill>
                            </td>
                            <td className="py-2.5 text-right font-medium">{money(b.amount)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
