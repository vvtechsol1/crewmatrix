"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Company, Trade } from "@/lib/types";
import { ProCard } from "@/components/pro-card";
import { EmptyState } from "@/components/ui";

export function FindProsClient({ subs, trades }: { subs: Company[]; trades: Trade[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [trade, setTrade] = useState<string>(params.get("trade") ?? "all");
  const [verifiedOnly, setVerifiedOnly] = useState(params.get("verified") === "1");

  function updateFilters(nextTrade: string, nextVerified: boolean) {
    const query = new URLSearchParams();
    if (nextTrade !== "all") query.set("trade", nextTrade);
    if (nextVerified) query.set("verified", "1");
    router.replace(query.size ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const results = useMemo(
    () =>
      subs
        .filter((c) => (trade === "all" ? true : c.trades.includes(trade as Trade)))
        .filter((c) =>
          verifiedOnly ? c.license.status === "verified" && c.insurance.status === "verified" : true,
        )
        .sort((a, b) => b.rating - a.rating),
    [subs, trade, verifiedOnly],
  );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end gap-5">
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-400">Trade</span>
          <select
            value={trade}
            onChange={(e) => {
              setTrade(e.target.value);
              updateFilters(e.target.value, verifiedOnly);
            }}
            className="min-w-48 rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-ink-100"
          >
            <option value="all">All trades</option>
            {trades.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2.5 text-sm text-ink-300">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => {
              setVerifiedOnly(e.target.checked);
              updateFilters(trade, e.target.checked);
            }}
            className="size-4 accent-hi-500"
          />
          Licence and insurance current only
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-400">
        <span>
          {results.length} {results.length === 1 ? "company" : "companies"}
          {trade !== "all" && ` in ${trade}`}
        </span>
        {(trade !== "all" || verifiedOnly) && (
          <button
            onClick={() => {
              setTrade("all");
              setVerifiedOnly(false);
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
            title="No companies match"
            sub="Try clearing the compliance filter — a certificate in review is often renewed within the week."
          />
        ) : (
          results.map((c) => <ProCard key={c.id} company={c} />)
        )}
      </div>
    </>
  );
}
