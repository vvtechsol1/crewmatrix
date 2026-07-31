"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, FileUp, MapPin } from "lucide-react";
import clsx from "clsx";
import { Button, Field, Input, Select, Steps, Textarea } from "@/components/form";
import type { Trade } from "@/lib/types";

const TRADES: Trade[] = [
  "Framing", "Electrical", "Plumbing", "HVAC", "Drywall", "Concrete",
  "Roofing", "Painting", "Masonry", "Excavation", "Flooring", "Landscaping",
];

const RADII = [25, 40, 50, 75, 100, 150];

export function OnboardingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const isSub = params.get("role") !== "contractor";

  const [step, setStep] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [radius, setRadius] = useState(50);
  const [crewSize, setCrewSize] = useState("");
  const [licence, setLicence] = useState({ number: "", expires: "" });
  const [insurance, setInsurance] = useState({ carrier: "", coverage: "1000000", expires: "" });
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string>();

  const labels = ["Trades", "Coverage", "Compliance", "Review"];

  function toggleTrade(t: Trade) {
    setTrades((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function next() {
    if (step === 0 && trades.length === 0) {
      setError("Pick at least one trade — this is what work gets matched against.");
      return;
    }
    setError(undefined);
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <div className="mb-9">
        <Steps current={step} labels={labels} />
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}

      {/* 1 — trades */}
      {step === 0 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isSub ? "What does your crew do?" : "What trades do you hire?"}
          </h1>
          <p className="mt-2 text-ink-400">
            {isSub
              ? "Work is matched on trade first. Pick everything you genuinely self-perform — not everything you can subcontract out."
              : "We use this to suggest crews when you post. You can post outside these any time."}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TRADES.map((t) => {
              const on = trades.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTrade(t)}
                  aria-pressed={on}
                  className={clsx(
                    "flex items-center justify-between rounded-lg border px-3.5 py-3 text-sm transition-colors",
                    on
                      ? "border-hi-500 bg-hi-500/[0.08] text-ink-100"
                      : "border-ink-800 bg-ink-900 text-ink-300 hover:border-ink-600",
                  )}
                >
                  {t}
                  {on && <Check size={15} className="text-hi-500" />}
                </button>
              );
            })}
          </div>

          {error && <p className="mt-3 text-sm text-bad-500">{error}</p>}

          <Button onClick={next} className="mt-8 w-full">
            Continue
          </Button>
        </>
      )}

      {/* 2 — coverage */}
      {step === 1 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">How far do you travel?</h1>
          <p className="mt-2 text-ink-400">
            Distance decides whether a job can be staffed at all, so it is filtered before price. Be honest — a
            radius you cannot service costs you a reputation, not just a trip.
          </p>

          <div className="mt-7 space-y-5">
            <Field label="Service radius" hint="You can change this any time from settings.">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {RADII.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadius(r)}
                    className={clsx(
                      "rounded-lg border py-2.5 text-sm transition-colors",
                      radius === r
                        ? "border-hi-500 bg-hi-500/[0.08]"
                        : "border-ink-800 bg-ink-900 text-ink-300 hover:border-ink-600",
                    )}
                  >
                    {r} mi
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label={isSub ? "Typical crew size" : "Field staff"}
              htmlFor="crew"
              hint="Headcount you can normally put on one site."
            >
              <Input
                id="crew"
                inputMode="numeric"
                value={crewSize}
                placeholder="9"
                onChange={(e) => setCrewSize(e.target.value)}
              />
            </Field>

            <Field
              label="Short description"
              htmlFor="bio"
              hint="Two or three sentences. What you are good at, and what you will not take on."
            >
              <Textarea
                id="bio"
                value={bio}
                placeholder="Commercial electrical — service, panels, tenant fit-outs. Two master electricians on staff."
                onChange={(e) => setBio(e.target.value)}
              />
            </Field>
          </div>

          <Button onClick={next} className="mt-8 w-full">
            Continue
          </Button>
        </>
      )}

      {/* 3 — compliance */}
      {step === 2 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Licence and insurance</h1>
          <p className="mt-2 text-ink-400">
            Both carry an expiry date. When one lapses your badge changes and you drop out of the compliance
            filter until a current document is uploaded — so nobody has to chase you for it.
          </p>

          <div className="mt-7 space-y-5">
            <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
              <div className="flex items-center gap-2 font-medium">
                <BadgeCheck size={16} className="text-hi-500" />
                Trade licence
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Licence number" htmlFor="lic">
                  <Input
                    id="lic"
                    value={licence.number}
                    placeholder="CO-EC-55219"
                    onChange={(e) => setLicence({ ...licence, number: e.target.value })}
                  />
                </Field>
                <Field label="Expires" htmlFor="lic-exp">
                  <Input
                    id="lic-exp"
                    type="date"
                    value={licence.expires}
                    onChange={(e) => setLicence({ ...licence, expires: e.target.value })}
                  />
                </Field>
              </div>
              <UploadBox label="Upload licence document" />
            </div>

            <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
              <div className="flex items-center gap-2 font-medium">
                <BadgeCheck size={16} className="text-hi-500" />
                General liability
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Carrier" htmlFor="carrier">
                  <Input
                    id="carrier"
                    value={insurance.carrier}
                    placeholder="Ironpoint"
                    onChange={(e) => setInsurance({ ...insurance, carrier: e.target.value })}
                  />
                </Field>
                <Field label="Coverage" htmlFor="cover">
                  <Select
                    id="cover"
                    value={insurance.coverage}
                    onChange={(e) => setInsurance({ ...insurance, coverage: e.target.value })}
                  >
                    <option value="1000000">$1M</option>
                    <option value="2000000">$2M</option>
                    <option value="5000000">$5M</option>
                  </Select>
                </Field>
                <Field label="Expires" htmlFor="ins-exp">
                  <Input
                    id="ins-exp"
                    type="date"
                    value={insurance.expires}
                    onChange={(e) => setInsurance({ ...insurance, expires: e.target.value })}
                  />
                </Field>
              </div>
              <UploadBox label="Upload certificate of insurance" />
            </div>
          </div>

          <Button onClick={next} className="mt-8 w-full">
            Continue
          </Button>
          <Button variant="quiet" onClick={next} className="mt-2 w-full">
            Skip for now — I will add these before bidding
          </Button>
        </>
      )}

      {/* 4 — review */}
      {step === 3 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Check this over</h1>
          <p className="mt-2 text-ink-400">This is what the other side sees before they decide to talk to you.</p>

          <dl className="mt-7 divide-y divide-ink-800 rounded-xl border border-ink-800 bg-ink-900">
            <Row label="Role" value={isSub ? "Subcontractor" : "General contractor"} />
            <Row label="Trades" value={trades.length ? trades.join(", ") : "—"} />
            <Row label="Service radius" value={`${radius} miles`} />
            <Row label="Crew size" value={crewSize || "—"} />
            <Row label="Licence" value={licence.number ? `${licence.number} · expires ${licence.expires || "—"}` : "Not supplied"} />
            <Row
              label="Insurance"
              value={
                insurance.carrier
                  ? `${insurance.carrier} · $${(Number(insurance.coverage) / 1_000_000).toFixed(0)}M · expires ${insurance.expires || "—"}`
                  : "Not supplied"
              }
            />
            <Row label="Description" value={bio || "—"} />
          </dl>

          <Button
            onClick={() => router.push(isSub ? "/dashboard/sub" : "/dashboard/contractor")}
            className="mt-8 w-full"
          >
            Finish and open my workspace
          </Button>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 px-5 py-3.5">
      <dt className="w-36 shrink-0 text-sm text-ink-400">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm">{value}</dd>
    </div>
  );
}

function UploadBox({ label }: { label: string }) {
  const [name, setName] = useState<string>();
  return (
    <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-ink-700 px-4 py-3.5 text-sm text-ink-400 transition-colors hover:border-ink-600 hover:text-ink-300">
      <FileUp size={16} />
      <span className="min-w-0 flex-1 truncate">{name ?? label}</span>
      <span className="text-xs text-ink-600">PDF or image</span>
      <input
        type="file"
        className="hidden"
        accept=".pdf,image/*"
        onChange={(e) => setName(e.target.files?.[0]?.name)}
      />
    </label>
  );
}

export function LocationNote({ city, state }: { city: string; state: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-400">
      <MapPin size={14} />
      {city}, {state}
    </div>
  );
}
