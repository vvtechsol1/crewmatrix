import { Suspense } from "react";
import type { Metadata } from "next";
import { activeTrades, listCompanies, listProjects } from "@/lib/db";
import { SectionHead } from "@/components/ui";
import { FindWorkClient } from "@/components/find-work-client";

export const metadata: Metadata = {
  title: "Find work — CrewMatrix",
  description: "Browse construction projects accepting bids, filtered by trade, distance and budget.",
};

export default async function FindWorkPage() {
  const [projects, contractors, trades] = await Promise.all([
    listProjects(),
    listCompanies("contractor"),
    activeTrades(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <SectionHead
        eyebrow="Marketplace"
        title="Find your next project"
        sub="Every job below carries a scope, a real budget range and the date the contractor needs boots on site."
      />

      <Suspense fallback={<div className="mt-8 text-sm text-ink-400">Loading filters…</div>}>
        <FindWorkClient projects={projects} contractors={contractors} trades={trades} />
      </Suspense>
    </div>
  );
}
