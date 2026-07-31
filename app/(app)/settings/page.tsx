import type { Metadata } from "next";
import { getCompany } from "@/lib/db";
import { shortDate } from "@/lib/format";
import { Card, VerifyBadge } from "@/components/ui";
import { CompanyProfileForm } from "@/components/company-profile-form";

export const metadata: Metadata = { title: "Company settings — CrewMatrix" };

export default async function CompanySettingsPage() {
  const company = await getCompany("sub-vega");
  if (!company) return null;

  return (
    <div className="space-y-6">
      <CompanyProfileForm
        initial={{
          name: company.name,
          contact: company.contact,
          city: company.city,
          state: company.state,
          radius: company.serviceRadiusMiles,
          crewSize: company.crewSize,
          bio: company.bio,
          trades: company.trades,
        }}
      />

      <Card className="p-6">
        <h2 className="font-medium">Compliance documents</h2>
        <p className="mt-1.5 text-sm text-ink-400">
          Expiry dates drive your badge. We remind you 30 days out, then again the week it lapses.
        </p>

        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-ink-800 p-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Trade licence</div>
              <div className="mt-0.5 text-sm text-ink-400">
                {company.license.number} · expires {shortDate(company.license.expires)}
              </div>
            </div>
            <VerifyBadge status={company.license.status} label="Licence" />
            <button className="rounded-md border border-ink-700 px-3 py-1.5 text-sm hover:bg-ink-800">
              Replace
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-ink-800 p-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">General liability</div>
              <div className="mt-0.5 text-sm text-ink-400">
                {company.insurance.carrier} · expires {shortDate(company.insurance.expires)}
              </div>
            </div>
            <VerifyBadge status={company.insurance.status} label="Insurance" />
            <button className="rounded-md border border-ink-700 px-3 py-1.5 text-sm hover:bg-ink-800">
              Replace
            </button>
          </div>
        </div>
      </Card>

      <Card className="border-bad-500/25 p-6">
        <h2 className="font-medium">Pause your listing</h2>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-400">
          Hides you from search and stops match alerts without deleting anything. Open bids stay live — pausing is
          not a way to walk away from a commitment.
        </p>
        <button className="mt-4 rounded-md border border-bad-500/40 px-4 py-2 text-sm text-bad-500 hover:bg-bad-500/10">
          Pause listing
        </button>
      </Card>
    </div>
  );
}
