"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Button, Field, Input, Select, Textarea } from "@/components/form";
import { Card } from "@/components/ui";
import type { Trade } from "@/lib/types";

const TRADES: Trade[] = [
  "Framing", "Electrical", "Plumbing", "HVAC", "Drywall", "Concrete",
  "Roofing", "Painting", "Masonry", "Excavation", "Flooring", "Landscaping",
];

const RADII = [25, 40, 50, 75, 100, 150];

export function CompanyProfileForm({
  initial,
}: {
  initial: {
    name: string;
    contact: string;
    city: string;
    state: string;
    radius: number;
    crewSize: number;
    bio: string;
    trades: Trade[];
  };
}) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  // Any edit clears the confirmation — a stale "Saved" over unsaved changes is
  // worse than no message at all.
  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">Company profile</h2>
          <p className="mt-1.5 text-sm text-ink-400">
            This is what contractors read before they invite you to bid.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-ok-500/30 bg-ok-500/10 px-2.5 py-1 text-xs font-medium text-ok-500">
            <Check size={13} /> Saved
          </span>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="cname">
            <Input id="cname" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Main contact" htmlFor="contact">
            <Input id="contact" value={form.contact} onChange={(e) => update("contact", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-[1fr_6rem_8rem] gap-3">
          <Field label="City" htmlFor="scity">
            <Input id="scity" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="State" htmlFor="sstate">
            <Select id="sstate" value={form.state} onChange={(e) => update("state", e.target.value)}>
              {["CO", "AZ", "NM", "UT", "TX", "WY"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Crew size" htmlFor="screw">
            <Input
              id="screw"
              inputMode="numeric"
              value={String(form.crewSize)}
              onChange={(e) => update("crewSize", Number(e.target.value) || 0)}
            />
          </Field>
        </div>

        <Field label="Service radius" hint="Work outside this never reaches you — widen it before dropping price.">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {RADII.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => update("radius", r)}
                className={clsx(
                  "rounded-lg border py-2.5 text-sm transition-colors",
                  form.radius === r
                    ? "border-hi-500 bg-hi-500/[0.08]"
                    : "border-ink-800 bg-ink-950 text-ink-300 hover:border-ink-600",
                )}
              >
                {r} mi
              </button>
            ))}
          </div>
        </Field>

        <Field label="Trades" hint="Only what you self-perform. This is what work is matched against.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TRADES.map((t) => {
              const on = form.trades.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    update("trades", on ? form.trades.filter((x) => x !== t) : [...form.trades, t])
                  }
                  className={clsx(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    on
                      ? "border-hi-500 bg-hi-500/[0.08]"
                      : "border-ink-800 bg-ink-950 text-ink-300 hover:border-ink-600",
                  )}
                >
                  {t}
                  {on && <Check size={14} className="text-hi-500" />}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Description" htmlFor="sbio">
          <Textarea id="sbio" value={form.bio} onChange={(e) => update("bio", e.target.value)} />
        </Field>
      </div>

      <Button onClick={() => setSaved(true)} className="mt-6">
        Save changes
      </Button>
    </Card>
  );
}
