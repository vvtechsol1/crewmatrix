import type { Metadata } from "next";
import Link from "next/link";
import { getCompany, getProject, listBids, listPayouts, listProjects, netOf } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { Avatar, ButtonLink, Card, EmptyState, Pill, SectionHead, Stat, VerifyBadge } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";
import { ConnectButton } from "@/components/connect-button";

export const metadata: Metadata = { title: "Subcontractor dashboard — CrewMatrix" };

const ME = "sub-vega";

const payoutTone = { paid: "ok", in_transit: "warn", pending: "neutral", held: "bad" } as const;

export default async function SubDashboard() {
  const me = await getCompany(ME);
  if (!me) return null;

  const [myBids, myPayouts] = await Promise.all([listBids({ subcontractorId: ME }), listPayouts(ME)]);

  // Matching is the product: trades we hold, inside the distance we travel.
  const openWork = await listProjects({ status: "open", withinMiles: me.serviceRadiusMiles });
  const alreadyBid = new Set(myBids.map((b) => b.projectId));
  const matches = openWork.filter((p) => me.trades.includes(p.trade) && !alreadyBid.has(p.id));

  const bidProjects = await Promise.all(myBids.map((b) => getProject(b.projectId)));
  const contractors = await Promise.all(
    bidProjects.map((p) => (p ? getCompany(p.contractorId) : Promise.resolve(undefined))),
  );

  const won = myBids.filter((b) => b.status === "awarded");
  const winRate = myBids.length ? Math.round((won.length / myBids.length) * 100) : 0;
  const earned = myPayouts.filter((p) => p.status === "paid").reduce((s, p) => s + netOf(p.gross, p.feePct), 0);
  const inFlight = myPayouts
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + netOf(p.gross, p.feePct), 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar company={me} size={52} />
          <div>
            <SectionHead eyebrow="Subcontractor workspace" title={me.name} />
            <div className="mt-1 text-sm text-ink-400">
              {me.city}, {me.state} · travels {me.serviceRadiusMiles} mi
            </div>
          </div>
        </div>
        <ButtonLink href="/find-work">Browse all work</ButtonLink>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open bids" value={String(myBids.filter((b) => b.status !== "declined").length)} />
        <Stat label="Win rate" value={`${winRate}%`} hint={`${won.length} of ${myBids.length} awarded`} />
        <Stat label="Paid out" value={money(earned)} hint="net of platform fee" />
        <Stat label="Awaiting release" value={money(inFlight)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div>
          {/* matches */}
          <h2 className="text-xl font-semibold tracking-tight">Matched to your crew</h2>
          <p className="mt-1 text-sm text-ink-400">
            {me.trades.join(", ")} work inside {me.serviceRadiusMiles} miles that you have not bid on yet.
          </p>

          <div className="mt-4 grid gap-4">
            {matches.length === 0 ? (
              <EmptyState
                title="You are bid on everything that matches"
                sub="Nothing new inside your radius right now. Widening the radius on your profile is usually the fastest way to see more."
              />
            ) : (
              matches.map((p) => <ProjectCard key={p.id} project={p} />)
            )}
          </div>

          {/* bids */}
          <h2 className="mt-10 text-xl font-semibold tracking-tight">Your bids</h2>
          <Card className="mt-4 divide-y divide-ink-800">
            {myBids.map((b, i) => {
              const p = bidProjects[i];
              const gc = contractors[i];
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      {p ? (
                        <Link href={`/projects/${p.id}`} className="hover:text-hi-500">
                          {p.title}
                        </Link>
                      ) : (
                        "Project withdrawn"
                      )}
                    </div>
                    <div className="text-xs text-ink-400">
                      {gc?.name ?? "—"} · submitted {shortDate(b.submittedAt)}
                    </div>
                  </div>
                  <Pill tone={b.status === "awarded" ? "ok" : b.status === "shortlisted" ? "warn" : "neutral"}>
                    {b.status}
                  </Pill>
                  <div className="w-24 text-right font-medium">{money(b.amount)}</div>
                </div>
              );
            })}
          </Card>

          {/* payouts */}
          <h2 className="mt-10 text-xl font-semibold tracking-tight">Payouts</h2>
          <Card className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Released</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Gross</th>
                  <th className="px-4 py-3 text-right font-medium">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {myPayouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-ink-300">{p.projectId}</td>
                    <td className="px-4 py-3 text-ink-300">{p.releasedAt ? shortDate(p.releasedAt) : "—"}</td>
                    <td className="px-4 py-3">
                      <Pill tone={payoutTone[p.status]}>{p.status.replace("_", " ")}</Pill>
                    </td>
                    <td className="px-4 py-3 text-right text-ink-300">{money(p.gross)}</td>
                    <td className="px-4 py-3 text-right font-medium">{money(netOf(p.gross, p.feePct))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="font-medium">Payout account</div>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              Money reaches you through Stripe Connect. Identity and bank verification happen once on Stripe&apos;s
              side, then milestone releases transfer straight to that account.
            </p>
            <div className="mt-4">
              <ConnectButton email={`${me.id}@example.com`} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="font-medium">Compliance</div>
            <div className="mt-3 space-y-2">
              <VerifyBadge status={me.license.status} label="Licence" />
              <VerifyBadge status={me.insurance.status} label="Insurance" />
            </div>
            <div className="mt-3 text-xs text-ink-400">
              Licence expires {shortDate(me.license.expires)} · insurance {shortDate(me.insurance.expires)}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
