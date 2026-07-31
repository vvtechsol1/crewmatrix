import type { Metadata } from "next";
import Link from "next/link";
import { Download, Receipt } from "lucide-react";
import { Card, Pill } from "@/components/ui";

export const metadata: Metadata = { title: "Billing — CrewMatrix" };

const invoices = [
  { id: "INV-2026-0714", date: "14 Jul 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-2026-0614", date: "14 Jun 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-2026-0514", date: "14 May 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-2026-0414", date: "14 Apr 2026", amount: "$79.00", status: "Paid" },
];

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-medium">Pro</h2>
              <Pill tone="ok">Active</Pill>
            </div>
            <p className="mt-1.5 text-sm text-ink-400">
              $79 per month · renews 14 August 2026 · unlimited bids and early access
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/pricing"
              className="rounded-md border border-ink-700 px-3.5 py-2 text-sm hover:bg-ink-800"
            >
              Change plan
            </Link>
            <button className="rounded-md px-3.5 py-2 text-sm text-ink-400 hover:text-bad-500">
              Cancel
            </button>
          </div>
        </div>

        <p className="mt-4 border-t border-ink-800 pt-4 text-xs leading-relaxed text-ink-400">
          Cancelling keeps the plan running to the end of the period you have already paid for. Open bids are not
          withdrawn — the plan lapsing does not walk you out of a commitment.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="font-medium">Payment method</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-ink-800 p-4">
          <span className="grid size-9 place-items-center rounded-md bg-ink-800 text-ink-300">
            <Receipt size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Card on file</div>
            <div className="text-sm text-ink-400">Stored with our payment provider, not on CrewMatrix</div>
          </div>
          <button className="rounded-md border border-ink-700 px-3.5 py-2 text-sm hover:bg-ink-800">
            Update
          </button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="font-medium">Invoices</h2>
          <p className="mt-1.5 text-sm text-ink-400">Every receipt, downloadable as PDF.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-y border-ink-800 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-3.5 font-mono text-xs">{i.id}</td>
                  <td className="px-6 py-3.5 text-ink-300">{i.date}</td>
                  <td className="px-6 py-3.5">
                    <Pill tone="ok">{i.status}</Pill>
                  </td>
                  <td className="px-6 py-3.5 text-right font-medium">{i.amount}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="text-ink-400 hover:text-ink-100" aria-label={`Download ${i.id}`}>
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
