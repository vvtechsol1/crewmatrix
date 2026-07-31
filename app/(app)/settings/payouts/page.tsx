import type { Metadata } from "next";
import { Banknote, ShieldCheck } from "lucide-react";
import { listPayouts, netOf } from "@/lib/db";
import { money, shortDate } from "@/lib/format";
import { Card, Pill, Stat } from "@/components/ui";
import { ConnectButton } from "@/components/connect-button";

export const metadata: Metadata = { title: "Payouts — CrewMatrix" };

const tone = { paid: "ok", in_transit: "warn", pending: "neutral", held: "bad" } as const;

export default async function PayoutSettingsPage() {
  const payouts = await listPayouts("sub-vega");
  const paid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + netOf(p.gross, p.feePct), 0);
  const waiting = payouts.filter((p) => p.status !== "paid").reduce((s, p) => s + netOf(p.gross, p.feePct), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Paid out" value={money(paid)} hint="net of platform fee" />
        <Stat label="Awaiting release" value={money(waiting)} />
        <Stat label="Platform fee" value="4%" hint="on the awarded amount" />
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Banknote size={17} className="text-hi-500" />
              <h2 className="font-medium">Payout account</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              Money reaches you through Stripe Connect. Identity and bank verification happen once on Stripe&apos;s
              side; after that, milestone releases transfer straight to your account, usually landing in two
              business days.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <ConnectButton email="accounts@vegaelectric.com" />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="font-medium">Release history</h2>
          <p className="mt-1.5 text-sm text-ink-400">
            Gross is what was agreed. Net is what lands after the platform fee.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-y border-ink-800 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Released</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Gross</th>
                <th className="px-6 py-3 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3.5 font-mono text-xs text-ink-300">{p.projectId}</td>
                  <td className="px-6 py-3.5 text-ink-300">
                    {p.releasedAt ? shortDate(p.releasedAt) : "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <Pill tone={tone[p.status]}>{p.status.replace("_", " ")}</Pill>
                  </td>
                  <td className="px-6 py-3.5 text-right text-ink-300">{money(p.gross)}</td>
                  <td className="px-6 py-3.5 text-right font-medium">{money(netOf(p.gross, p.feePct))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-ok-500" />
          <div>
            <div className="font-medium">Why funds are held</div>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-400">
              A payout moves to <em>held</em> only when a dispute is opened on the project. Both sides can see the
              same record and the same dates, which settles most of them without anyone needing to arbitrate.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
