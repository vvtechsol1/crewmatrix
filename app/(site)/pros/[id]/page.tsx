import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { getCompany, getProject, listBids, listCompanies, listProjects } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { Avatar, ButtonLink, Card, Pill, Rating, Stat, VerifyBadge } from "@/components/ui";

export async function generateStaticParams() {
  const all = await listCompanies();
  return all.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return { title: "Company not found — CrewMatrix" };

  return {
    title: `${company.name} — ${company.trades.join(", ")} in ${company.city}, ${company.state} — CrewMatrix`,
    description: company.bio,
  };
}

export default async function ProPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const isSub = company.role === "subcontractor";

  const [ownBids, posted] = await Promise.all([
    isSub ? listBids({ subcontractorId: company.id }) : Promise.resolve([]),
    isSub ? Promise.resolve([]) : listProjects({ contractorId: company.id }),
  ]);

  const bidProjects = await Promise.all(ownBids.map((b) => getProject(b.projectId)));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link href={isSub ? "/find-pros" : "/find-work"} className="text-sm text-ink-400 hover:text-ink-100">
        ← Back to marketplace
      </Link>

      <header className="mt-6 flex flex-wrap items-start gap-5">
        <Avatar company={company} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
            <Rating value={company.rating} count={company.reviewCount} />
          </div>
          <div className="mt-1 text-sm text-ink-400">
            {company.contact} · {isSub ? "Subcontractor" : "General contractor"}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {company.trades.map((t) => (
              <Pill key={t} tone="accent">
                {t}
              </Pill>
            ))}
          </div>
        </div>
        <ButtonLink href={isSub ? "/dashboard/contractor" : "/dashboard/sub"}>
          {isSub ? "Invite to a project" : "Message"}
        </ButtonLink>
      </header>

      <p className="mt-6 max-w-3xl leading-relaxed text-ink-300">{company.bio}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Jobs completed" value={String(company.completedJobs)} />
        <Stat label="Crew size" value={String(company.crewSize)} hint="typical deployed headcount" />
        <Stat label="Years in business" value={String(company.yearsInBusiness)} />
        <Stat
          label="Service radius"
          value={`${company.serviceRadiusMiles} mi`}
          hint={`from ${company.city}, ${company.state}`}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-medium">Compliance</h2>
          <div className="mt-4 space-y-3">
            <div>
              <VerifyBadge status={company.license.status} label="Licence" />
              <div className="mt-1.5 text-sm text-ink-400">
                {company.license.number} · expires {shortDate(company.license.expires)}
              </div>
            </div>
            <div>
              <VerifyBadge status={company.insurance.status} label="Insurance" />
              <div className="mt-1.5 text-sm text-ink-400">
                {company.insurance.carrier} · {money(company.insurance.coverage)} cover · expires{" "}
                {shortDate(company.insurance.expires)}
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Expiry dates drive the badge. When a certificate lapses the company stops appearing under the
            compliance filter until a current document is supplied.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="font-medium">Coverage</h2>
          <div className="mt-4 space-y-3 text-sm text-ink-300">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-ink-400" />
              Based in {company.city}, {company.state}
            </div>
            <div className="flex items-center gap-2">
              <Users size={15} className="text-ink-400" />
              Crew of {company.crewSize} across {company.trades.length}{" "}
              {company.trades.length === 1 ? "trade" : "trades"}
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Travel radius is what decides whether a project can be staffed at all, so it is matched before price.
          </p>
        </Card>
      </div>

      {isSub && ownBids.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Bid history</h2>
          <Card className="mt-4 divide-y divide-ink-800">
            {ownBids.map((b, i) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">
                    {bidProjects[i]?.title ?? "Project no longer listed"}
                  </div>
                  <div className="text-xs text-ink-400">submitted {shortDate(b.submittedAt)}</div>
                </div>
                <Pill tone={b.status === "awarded" ? "ok" : b.status === "declined" ? "bad" : "neutral"}>
                  {b.status}
                </Pill>
                <div className="w-24 text-right font-medium">{money(b.amount)}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {!isSub && posted.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Projects posted</h2>
          <Card className="mt-4 divide-y divide-ink-800">
            {posted.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex flex-wrap items-center gap-3 p-4 hover:bg-ink-800/50">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{p.title}</div>
                  <div className="text-xs text-ink-400">
                    {p.trade} · {p.bidCount} bids
                  </div>
                </div>
                <Pill tone={p.status === "open" ? "ok" : "neutral"}>{p.status.replace("_", " ")}</Pill>
              </Link>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
