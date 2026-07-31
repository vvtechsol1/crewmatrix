"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plus, X } from "lucide-react";
import clsx from "clsx";
import { Button, Field, Input, Select, Steps, Textarea } from "@/components/form";
import type { Trade } from "@/lib/types";

const TRADES: Trade[] = [
  "Framing", "Electrical", "Plumbing", "HVAC", "Drywall", "Concrete",
  "Roofing", "Painting", "Masonry", "Excavation", "Flooring", "Landscaping",
];

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function PostProjectFlow() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [basics, setBasics] = useState({ title: "", trade: "Electrical" as Trade, city: "", state: "CO" });
  const [scope, setScope] = useState("");
  const [requirements, setRequirements] = useState<string[]>([
    "Active state licence for the trade",
    "$1M general liability minimum",
  ]);
  const [reqDraft, setReqDraft] = useState("");
  const [terms, setTerms] = useState({ low: "", high: "", start: "", weeks: "", invite: "all" });

  function validateBasics() {
    const e: Record<string, string> = {};
    if (basics.title.trim().length < 8) e.title = "Give it a title a crew can price from.";
    if (basics.city.trim().length < 2) e.city = "Where is the site?";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function validateScope() {
    const e: Record<string, string> = {};
    if (scope.trim().length < 40) e.scope = "A thin scope gets padded bids. Say what is and is not included.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function validateTerms() {
    const e: Record<string, string> = {};
    const low = Number(terms.low);
    const high = Number(terms.high);
    if (!low) e.low = "Required.";
    if (!high) e.high = "Required.";
    if (low && high && high < low) e.high = "The top of the range is below the bottom.";
    if (!terms.start) e.start = "Crews plan around this date.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function publish() {
    setBusy(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: basics.title,
          trade: basics.trade,
          city: basics.city,
          state: basics.state,
          scope,
          requirements,
          budgetLow: Number(terms.low),
          budgetHigh: Number(terms.high),
          startDate: terms.start,
          durationWeeks: Number(terms.weeks),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setErrors({ form: data.error ?? "Could not publish the project." });
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setErrors({ form: "Network problem — the project was not published." });
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-ok-500/15 text-ok-500">
          <CheckCircle2 size={24} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Your project is live</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-400">
          {basics.trade} crews inside range have been notified. Bids land on the project page, and you will get a
          summary each morning until you award it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/contractor"
            className="rounded-md bg-hi-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-hi-400"
          >
            Back to overview
          </Link>
          <Link
            href="/find-pros"
            className="rounded-md border border-ink-700 px-4 py-2 text-sm font-medium hover:bg-ink-800"
          >
            Invite specific crews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-9">
        <Steps current={step} labels={["Basics", "Scope", "Budget & dates", "Review"]} />
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}

      {step === 0 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">What are you putting out?</h1>
          <p className="mt-2 text-ink-400">Trade and location decide who sees this, so get these two right.</p>

          <div className="mt-7 space-y-4">
            <Field label="Project title" htmlFor="title" error={errors.title} hint="Say the work and the size.">
              <Input
                id="title"
                value={basics.title}
                placeholder="Electrical rough-in — 48-unit multi-family, Building C"
                onChange={(e) => setBasics({ ...basics, title: e.target.value })}
              />
            </Field>

            <Field label="Trade" htmlFor="trade">
              <Select
                id="trade"
                value={basics.trade}
                onChange={(e) => setBasics({ ...basics, trade: e.target.value as Trade })}
              >
                {TRADES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input
                  id="city"
                  value={basics.city}
                  placeholder="Denver"
                  onChange={(e) => setBasics({ ...basics, city: e.target.value })}
                />
              </Field>
              <Field label="State" htmlFor="state">
                <Select
                  id="state"
                  value={basics.state}
                  onChange={(e) => setBasics({ ...basics, state: e.target.value })}
                >
                  {["CO", "AZ", "NM", "UT", "TX", "WY"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <Button onClick={() => validateBasics() && setStep(1)} className="mt-8 w-full">
            Continue
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Scope and requirements</h1>
          <p className="mt-2 text-ink-400">
            The clearer this is, the tighter the bids come back. Exclusions matter as much as inclusions.
          </p>

          <div className="mt-7 space-y-5">
            <Field label="Scope of work" htmlFor="scope" error={errors.scope}>
              <Textarea
                id="scope"
                value={scope}
                className="min-h-40"
                placeholder="Full electrical rough-in for Building C. Panels, unit feeders, device boxes and low-voltage sleeves. Drawings are permitted and released; no design work required."
                onChange={(e) => setScope(e.target.value)}
              />
            </Field>

            <div>
              <div className="mb-1.5 text-sm font-medium text-ink-300">Requirements</div>
              <div className="space-y-2">
                {requirements.map((r, i) => (
                  <div key={r} className="flex items-center gap-2 rounded-md border border-ink-800 bg-ink-900 px-3 py-2">
                    <span className="flex-1 text-sm">{r}</span>
                    <button
                      onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                      className="text-ink-600 hover:text-bad-500"
                      aria-label={`Remove ${r}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex gap-2">
                <Input
                  value={reqDraft}
                  placeholder="Weekly look-ahead schedule every Friday"
                  onChange={(e) => setReqDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && reqDraft.trim()) {
                      e.preventDefault();
                      setRequirements([...requirements, reqDraft.trim()]);
                      setReqDraft("");
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (reqDraft.trim()) {
                      setRequirements([...requirements, reqDraft.trim()]);
                      setReqDraft("");
                    }
                  }}
                >
                  <Plus size={15} /> Add
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={() => validateScope() && setStep(2)} className="mt-8 w-full">
            Continue
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Budget and schedule</h1>
          <p className="mt-2 text-ink-400">
            A published range gets better bids than hiding it. Crews who cannot work inside it will not waste your
            time, and the ones who can will price honestly.
          </p>

          <div className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget from" htmlFor="low" error={errors.low}>
                <Input
                  id="low"
                  inputMode="numeric"
                  value={terms.low}
                  placeholder="145000"
                  onChange={(e) => setTerms({ ...terms, low: e.target.value })}
                />
              </Field>
              <Field label="Budget to" htmlFor="high" error={errors.high}>
                <Input
                  id="high"
                  inputMode="numeric"
                  value={terms.high}
                  placeholder="178000"
                  onChange={(e) => setTerms({ ...terms, high: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Boots on site" htmlFor="start" error={errors.start}>
                <Input
                  id="start"
                  type="date"
                  value={terms.start}
                  onChange={(e) => setTerms({ ...terms, start: e.target.value })}
                />
              </Field>
              <Field label="Duration (weeks)" htmlFor="weeks">
                <Input
                  id="weeks"
                  inputMode="numeric"
                  value={terms.weeks}
                  placeholder="9"
                  onChange={(e) => setTerms({ ...terms, weeks: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Who can bid" htmlFor="invite">
              <Select
                id="invite"
                value={terms.invite}
                onChange={(e) => setTerms({ ...terms, invite: e.target.value })}
              >
                <option value="all">Any qualified crew in range</option>
                <option value="verified">Only crews with current licence and insurance</option>
                <option value="invited">Invite only — I will pick who sees it</option>
              </Select>
            </Field>
          </div>

          <Button onClick={() => validateTerms() && setStep(3)} className="mt-8 w-full">
            Review
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Publish this?</h1>
          <p className="mt-2 text-ink-400">Once live, matching crews are notified straight away.</p>

          <div className="mt-7 rounded-xl border border-ink-800 bg-ink-900">
            <div className="border-b border-ink-800 p-5">
              <div
                className={clsx(
                  "inline-flex rounded-md border border-hi-500/30 bg-hi-500/10 px-2 py-0.5 text-xs font-medium text-hi-500",
                )}
              >
                {basics.trade}
              </div>
              <h2 className="mt-2 font-medium leading-snug">{basics.title}</h2>
              <div className="mt-1 text-sm text-ink-400">
                {basics.city}, {basics.state}
              </div>
            </div>

            <dl className="divide-y divide-ink-800">
              <Row label="Budget" value={`${money(Number(terms.low))} – ${money(Number(terms.high))}`} />
              <Row label="Starts" value={terms.start || "—"} />
              <Row label="Duration" value={terms.weeks ? `${terms.weeks} weeks` : "—"} />
              <Row
                label="Visibility"
                value={
                  terms.invite === "all"
                    ? "Any qualified crew in range"
                    : terms.invite === "verified"
                      ? "Compliant crews only"
                      : "Invite only"
                }
              />
              <Row label="Requirements" value={requirements.join(" · ") || "—"} />
              <Row label="Scope" value={scope} />
            </dl>
          </div>

          {errors.form && (
            <div className="mt-5 rounded-md border border-bad-500/30 bg-bad-500/10 px-3.5 py-2.5 text-sm text-bad-500">
              {errors.form}
            </div>
          )}

          <Button onClick={publish} disabled={busy} className="mt-8 w-full">
            {busy ? "Publishing…" : "Publish project"}
          </Button>
          <Button variant="quiet" onClick={() => setStep(0)} className="mt-2 w-full">
            Keep editing
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
