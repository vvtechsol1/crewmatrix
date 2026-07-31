"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { Button, Field, Input, Steps, Textarea } from "@/components/form";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function BidFlow({
  projectId,
  projectTitle,
  budgetLow,
  budgetHigh,
  feePct,
}: {
  projectId: string;
  projectTitle: string;
  budgetLow: number;
  budgetHigh: number;
  feePct: number;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bid, setBid] = useState({ amount: "", crew: "", start: "", weeks: "", note: "" });

  async function submitBid() {
    setBusy(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          amount: Number(bid.amount),
          crewSize: Number(bid.crew),
          startAvailable: bid.start,
          durationWeeks: Number(bid.weeks),
          note: bid.note,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setErrors({ form: data.error ?? "Could not submit the bid." });
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setErrors({ form: "Network problem — your bid was not sent." });
      setBusy(false);
    }
  }

  const amount = Number(bid.amount) || 0;
  const net = Math.round(amount * (1 - feePct / 100));
  const mid = (budgetLow + budgetHigh) / 2;

  function validate() {
    const e: Record<string, string> = {};
    if (!amount) e.amount = "Required.";
    if (!bid.crew) e.crew = "How many bodies?";
    if (!bid.start) e.start = "The date is half the decision.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-ok-500/15 text-ok-500">
          <CheckCircle2 size={24} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Bid submitted</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-400">
          {money(amount)} for {projectTitle}. The contractor sees it immediately and can message you on the
          project thread. You can revise it until the job is awarded.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/sub"
            className="rounded-md bg-hi-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-hi-400"
          >
            Back to my bids
          </Link>
          <Link
            href="/find-work"
            className="rounded-md border border-ink-700 px-4 py-2 text-sm font-medium hover:bg-ink-800"
          >
            Find more work
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link href={`/projects/${projectId}`} className="text-sm text-ink-400 hover:text-ink-100">
        ← {projectTitle}
      </Link>

      <div className="my-8">
        <Steps current={step} labels={["Your number", "Review"]} />
      </div>

      {step === 1 && (
        <button
          onClick={() => setStep(0)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}

      {step === 0 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Submit your bid</h1>
          <p className="mt-2 text-ink-400">
            Posted range is {money(budgetLow)} – {money(budgetHigh)}. Bidding outside it is allowed — say why in
            the note and it usually still gets read.
          </p>

          <div className="mt-7 space-y-4">
            <Field
              label="Your price"
              htmlFor="amount"
              error={errors.amount}
              hint={amount ? `You keep ${money(net)} after the ${feePct}% platform fee.` : undefined}
            >
              <Input
                id="amount"
                inputMode="numeric"
                value={bid.amount}
                placeholder="158400"
                onChange={(e) => setBid({ ...bid, amount: e.target.value })}
              />
            </Field>

            {amount > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-ink-800 bg-ink-900 px-3.5 py-2.5 text-sm">
                {amount > mid ? (
                  <TrendingUp size={15} className="text-warn-500" />
                ) : (
                  <TrendingDown size={15} className="text-ok-500" />
                )}
                <span className="text-ink-300">
                  {amount > budgetHigh
                    ? "Above the posted range."
                    : amount < budgetLow
                      ? "Below the posted range — make sure nothing is missing."
                      : amount > mid
                        ? "Upper half of the range."
                        : "Lower half of the range."}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Crew size" htmlFor="crew" error={errors.crew}>
                <Input
                  id="crew"
                  inputMode="numeric"
                  value={bid.crew}
                  placeholder="8"
                  onChange={(e) => setBid({ ...bid, crew: e.target.value })}
                />
              </Field>
              <Field label="Weeks" htmlFor="weeks">
                <Input
                  id="weeks"
                  inputMode="numeric"
                  value={bid.weeks}
                  placeholder="9"
                  onChange={(e) => setBid({ ...bid, weeks: e.target.value })}
                />
              </Field>
            </div>

            <Field
              label="Earliest honest start"
              htmlFor="start"
              error={errors.start}
              hint="Not the date you wish you could start."
            >
              <Input
                id="start"
                type="date"
                value={bid.start}
                onChange={(e) => setBid({ ...bid, start: e.target.value })}
              />
            </Field>

            <Field
              label="Note to the contractor"
              htmlFor="note"
              hint="What is included, what is excluded, and anything about the schedule they should know."
            >
              <Textarea
                id="note"
                value={bid.note}
                placeholder="We have run three buildings on this unit type. Price includes temp power maintenance."
                onChange={(e) => setBid({ ...bid, note: e.target.value })}
              />
            </Field>
          </div>

          <Button onClick={() => validate() && setStep(1)} className="mt-8 w-full">
            Review bid
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Send this?</h1>
          <p className="mt-2 text-ink-400">You can revise it any time before the job is awarded.</p>

          <dl className="mt-7 divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900">
            <Row label="Project" value={projectTitle} />
            <Row label="Your price" value={money(amount)} />
            <Row label={`After ${feePct}% fee`} value={money(net)} />
            <Row label="Crew" value={bid.crew || "—"} />
            <Row label="Start" value={bid.start || "—"} />
            <Row label="Duration" value={bid.weeks ? `${bid.weeks} weeks` : "—"} />
            <Row label="Note" value={bid.note || "—"} />
          </dl>

          {errors.form && (
            <div className="mt-5 rounded-md border border-bad-500/30 bg-bad-500/10 px-3.5 py-2.5 text-sm text-bad-500">
              {errors.form}
            </div>
          )}

          <Button onClick={submitBid} disabled={busy} className="mt-8 w-full">
            {busy ? "Sending your bid…" : "Submit bid"}
          </Button>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 px-5 py-3.5">
      <dt className="w-32 shrink-0 text-sm text-ink-400">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}
