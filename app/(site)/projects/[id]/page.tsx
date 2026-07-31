import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Check, MapPin, Timer } from "lucide-react";
import { getCompany, getProject, listBids, listMessages, listProjects } from "@/lib/db";
import { money, moneyRange, shortDate, sinceLabel } from "@/lib/format";
import { Avatar, ButtonLink, Card, Pill, Rating, VerifyBadge } from "@/components/ui";

export async function generateStaticParams() {
  const all = await listProjects();
  return all.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project not found — CrewMatrix" };

  return {
    title: `${project.title} — CrewMatrix`,
    description: `${project.trade} work in ${project.city}, ${project.state}. ${moneyRange(
      project.budgetLow,
      project.budgetHigh,
    )} over ${project.durationWeeks} weeks.`,
  };
}

const bidTone = {
  submitted: "neutral",
  shortlisted: "warn",
  awarded: "ok",
  declined: "bad",
} as const;

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const [contractor, bids, thread] = await Promise.all([
    getCompany(project.contractorId),
    listBids({ projectId: project.id }),
    listMessages(project.id),
  ]);

  const bidders = await Promise.all(bids.map((b) => getCompany(b.subcontractorId)));
  const low = bids.length ? Math.min(...bids.map((b) => b.amount)) : 0;
  const high = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/find-work" className="text-sm text-ink-400 hover:text-ink-100">
        ← Back to open work
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="accent">{project.trade}</Pill>
            <Pill tone={project.status === "open" ? "ok" : "neutral"}>
              {project.status === "open" ? "Accepting bids" : project.status.replace("_", " ")}
            </Pill>
            <span className="text-xs text-ink-400">posted {sinceLabel(project.postedAt)}</span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{project.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-300">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} className="text-ink-400" />
              {project.city}, {project.state} · {project.distanceMiles} mi out
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} className="text-ink-400" />
              starts {shortDate(project.startDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer size={15} className="text-ink-400" />
              {project.durationWeeks} weeks
            </span>
          </div>

          <Card className="mt-8 p-6">
            <h2 className="font-medium">Scope</h2>
            <p className="mt-3 leading-relaxed text-ink-300">{project.scope}</p>

            <h3 className="mt-7 font-medium">Requirements</h3>
            <ul className="mt-3 space-y-2">
              {project.requirements.map((r) => (
                <li key={r} className="flex gap-2.5 text-sm text-ink-300">
                  <Check size={16} className="mt-0.5 shrink-0 text-ok-500" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          {/* bids */}
          <div className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Bids received</h2>
              {bids.length > 1 && (
                <span className="text-sm text-ink-400">
                  spread {money(low)} – {money(high)}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {bids.map((b, i) => {
                const sub = bidders[i];
                return (
                  <Card key={b.id} className="p-5">
                    <div className="flex flex-wrap items-start gap-4">
                      {sub && <Avatar company={sub} size={40} />}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-medium">
                            {sub ? (
                              <Link href={`/pros/${sub.id}`} className="hover:text-hi-500">
                                {sub.name}
                              </Link>
                            ) : (
                              "Withdrawn"
                            )}
                          </span>
                          {sub && <Rating value={sub.rating} count={sub.reviewCount} />}
                          <Pill tone={bidTone[b.status]}>{b.status}</Pill>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-300">{b.note}</p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-400">
                          <span>crew of {b.crewSize}</span>
                          <span>can start {shortDate(b.startAvailable)}</span>
                          <span>{b.durationWeeks} weeks</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold tracking-tight">{money(b.amount)}</div>
                        <div className="text-xs text-ink-400">submitted {sinceLabel(b.submittedAt)}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* messages */}
          {thread.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight">Project thread</h2>
              <p className="mt-1 text-sm text-ink-400">
                Kept on the project so a schedule change and the bid it affects stay in the same place.
              </p>
              <Card className="mt-4 divide-y divide-ink-800">
                {thread.map((m) => (
                  <div key={m.id} className="p-5">
                    <div className="text-xs text-ink-400">
                      {m.fromId === project.contractorId ? "Contractor" : "Subcontractor"} ·{" "}
                      {new Date(m.sentAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{m.body}</p>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

        {/* sidebar */}
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wide text-ink-400">Budget range</div>
            <div className="mt-1.5 text-2xl font-semibold tracking-tight">
              {moneyRange(project.budgetLow, project.budgetHigh)}
            </div>
            <div className="mt-1 text-xs text-ink-400">
              {project.platformFeePct}% platform fee on the awarded amount
            </div>

            <ButtonLink href={`/projects/${project.id}/bid`} className="mt-5 w-full">
              Submit a bid
            </ButtonLink>
            <ButtonLink href="/messages" variant="ghost" className="mt-2 w-full">
              Message the contractor
            </ButtonLink>
          </Card>

          {contractor && (
            <Card className="p-5">
              <div className="text-xs uppercase tracking-wide text-ink-400">Posted by</div>
              <div className="mt-3 flex items-center gap-3">
                <Avatar company={contractor} size={40} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{contractor.name}</div>
                  <Rating value={contractor.rating} count={contractor.reviewCount} />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-400">{contractor.bio}</p>
              <div className="mt-4 space-y-2">
                <VerifyBadge status={contractor.license.status} label="Licence" />
                <VerifyBadge status={contractor.insurance.status} label="Insurance" />
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-400">Years in business</dt>
                  <dd>{contractor.yearsInBusiness}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-400">Jobs completed</dt>
                  <dd>{contractor.completedJobs}</dd>
                </div>
              </dl>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
