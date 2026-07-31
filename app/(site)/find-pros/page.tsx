import { Suspense } from "react";
import type { Metadata } from "next";
import { listCompanies } from "@/lib/db";
import { SectionHead } from "@/components/ui";
import { FindProsClient } from "@/components/find-pros-client";

export const metadata: Metadata = {
  title: "Find subcontractors — CrewMatrix",
  description: "Browse licensed subcontractors by trade, crew size and service radius.",
};

export default async function FindProsPage() {
  const subs = await listCompanies("subcontractor");
  const trades = Array.from(new Set(subs.flatMap((c) => c.trades))).sort();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <SectionHead
        eyebrow="Marketplace"
        title="Find subcontractors you can put on a schedule"
        sub="Crew size, service radius and current paperwork are on the card, so the first call is about the job rather than the basics."
      />

      <Suspense fallback={<div className="mt-8 text-sm text-ink-400">Loading filters…</div>}>
        <FindProsClient subs={subs} trades={trades} />
      </Suspense>
    </div>
  );
}
