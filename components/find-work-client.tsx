"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Company, Project, Trade } from "@/lib/types";
import { ProjectCard } from "@/components/project-card";
import { Card, EmptyState } from "@/components/ui";

const radii = [25, 50, 75, 150];
const floors = [50_000, 100_000, 200_000];

/**
 * Filtering runs in the browser rather than on the server.
 *
 * The whole open-work set is small enough to ship once, and doing it this way
 * keeps the route static: no server render per filter change, no CPU burned on
 * a Worker for what is three array predicates, and the filters feel instant
 * because nothing goes over the network.
 */
export function FindWorkClient({
  projects,
  contractors,
  trades,
}: {
  projects: Project[];
  contractors: Company[];
  trades: Trade[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [trade, setTrade] = useState<string>(params.get("trade") ?? "all");
  const [radius, setRadius] = useState<string>(params.get("radius") ?? "");
  const [min, setMin] = useState<string>(params.get("min") ?? "");

  function updateFilters(next: { trade?: string; radius?: string; min?: string }) {
    const values = { trade, radius, min, ...next };
    const query = new URLSearchParams();
    if (values.trade !== "all") query.set("trade", values.trade);
    if (values.radius) query.set("radius", values.radius);
    if (values.min) query.set("min", values.min);
    router.replace(query.size ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const byId = useMemo(() => new Map(contractors.map((c) => [c.id, c])), [contractors]);

  const results = useMemo(
    () =>
      projects
        .filter((p) => (trade === "all" ? true : p.trade === trade))
        .filter((p) => (radius ? p.distanceMiles <= Number(radius) : true))
        .filter((p) => (min ? p.budgetHigh >= Number(min) : true)),
    [projects, trade, radius, min],
  );

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-400">Trade</span>
          <select
            value={trade}
            onChange={(e) => {
              setTrade(e.target.value);
              updateFilters({ trade: e.target.value });
            }}
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-ink-100"
          >
            <option value="all">All trades</option>
            {trades.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1.5 block text-ink-400">Within</span>
          <select
            value={radius}
            onChange={(e) => {
              setRadius(e.target.value);
              updateFilters({ radius: e.target.value });
            }}
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-ink-100"
          >
            <option value="">Any distance</option>
            {radii.map((r) => (
              <option key={r} value={r}>
                {r} miles
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1.5 block text-ink-400">Budget at least</span>
          <select
            value={min}
            onChange={(e) => {
              setMin(e.target.value);
              updateFilters({ min: e.target.value });
            }}
            className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-ink-100"
          >
            <option value="">Any budget</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                ${(f / 1000).toFixed(0)}k+
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-400">
        <span>
          {results.length} {results.length === 1 ? "project" : "projects"}
          {trade !== "all" && ` in ${trade}`}
          {radius && ` within ${radius} miles`}
        </span>
        {(trade !== "all" || radius || min) && (
          <button
            onClick={() => {
              setTrade("all");
              setRadius("");
              setMin("");
              router.replace(pathname, { scroll: false });
            }}
            className="min-h-11 rounded-md px-2 font-medium text-hi-500 hover:bg-hi-500/10 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4">
        {results.length === 0 ? (
          <EmptyState
            title="Nothing matches those filters"
            sub="Widen the radius or clear the budget floor — work in your trade may be sitting just outside the current range."
          />
        ) : (
          results.map((p) => <ProjectCard key={p.id} project={p} contractor={byId.get(p.contractorId)} />)
        )}
      </div>

      <Card className="mt-10 p-6">
        <div className="font-medium">Not seeing your trade?</div>
        <p className="mt-2 max-w-2xl text-sm text-ink-400">
          Projects are matched against the trades on your company profile and the radius you set. Widening your
          radius by twenty miles usually opens more work than dropping your price.
        </p>
      </Card>
    </>
  );
}
