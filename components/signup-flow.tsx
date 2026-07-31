"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, HardHat } from "lucide-react";
import { Button, ChoiceCard, Field, Input, Select, Steps } from "@/components/form";
import type { Role } from "@/lib/types";

const STATES = ["CO", "AZ", "NM", "UT", "TX", "KS", "NE", "WY"];

export function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [account, setAccount] = useState({ name: "", email: "", password: "", phone: "" });
  const [company, setCompany] = useState({ name: "", city: "", state: "CO", years: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function createAccount() {
    if (!validateCompany()) return;

    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          name: account.name,
          role,
          company: company.name,
          city: company.city,
          state: company.state,
          years: company.years,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; confirmEmail?: boolean };

      if (!res.ok || !data.ok) {
        setErrors({ form: data.error ?? "Could not create the account." });
        setBusy(false);
        return;
      }

      if (data.confirmEmail) {
        setErrors({ form: "Account created — confirm the email we just sent, then log in." });
        setBusy(false);
        return;
      }

      router.push(`/onboarding?role=${role}`);
      router.refresh();
    } catch {
      setErrors({ form: "Network problem — try again." });
      setBusy(false);
    }
  }

  function validateAccount() {
    const e: Record<string, string> = {};
    if (account.name.trim().length < 2) e.name = "We need a name for the account.";
    if (!/^\S+@\S+\.\S+$/.test(account.email)) e.email = "That email does not look right.";
    if (account.password.length < 8) e.password = "Use at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateCompany() {
    const e: Record<string, string> = {};
    if (company.name.trim().length < 2) e.company = "Companies bid under a name — what is yours?";
    if (company.city.trim().length < 2) e.city = "Which city do you work out of?";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div>
      <div className="mb-8">
        <Steps current={step} labels={["Your role", "Account", "Company"]} />
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}

      {/* step 1 — role */}
      {step === 0 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Which side are you on?</h1>
          <p className="mt-2 text-sm text-ink-400">
            This decides what your workspace shows. You can add the other side later if you both hire and take work.
          </p>

          <div className="mt-7 grid gap-3">
            <ChoiceCard
              selected={role === "contractor"}
              onClick={() => setRole("contractor")}
              icon={<Building2 size={17} strokeWidth={2.3} />}
              title="I hire crews"
              body="General contractor. Post projects, compare bids, award work and release payouts."
            />
            <ChoiceCard
              selected={role === "subcontractor"}
              onClick={() => setRole("subcontractor")}
              icon={<HardHat size={17} strokeWidth={2.3} />}
              title="I look for work"
              body="Subcontractor. Get matched to projects in your trades and inside your travel radius."
            />
          </div>

          <Button disabled={!role} onClick={() => setStep(1)} className="mt-7 w-full">
            Continue
          </Button>
        </>
      )}

      {/* step 2 — account */}
      {step === 1 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-ink-400">This is how you sign in and where notifications land.</p>

          <div className="mt-7 space-y-4">
            <Field label="Your name" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                value={account.name}
                placeholder="Dana Halloran"
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
              />
            </Field>
            <Field label="Work email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={account.email}
                placeholder="you@company.com"
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
              />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              error={errors.password}
              hint="At least 8 characters."
            >
              <Input
                id="password"
                type="password"
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
              />
            </Field>
            <Field label="Mobile" htmlFor="phone" hint="Used for bid alerts. Optional.">
              <Input
                id="phone"
                value={account.phone}
                placeholder="(303) 555-0142"
                onChange={(e) => setAccount({ ...account, phone: e.target.value })}
              />
            </Field>
          </div>

          <Button
            onClick={() => {
              if (validateAccount()) setStep(2);
            }}
            className="mt-7 w-full"
          >
            Continue
          </Button>
        </>
      )}

      {/* step 3 — company */}
      {step === 2 && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Tell us about the company</h1>
          <p className="mt-2 text-sm text-ink-400">
            {role === "contractor"
              ? "Subcontractors see this before they bid."
              : "Contractors see this before they invite you."}
          </p>

          <div className="mt-7 space-y-4">
            <Field label="Company name" htmlFor="company" error={errors.company}>
              <Input
                id="company"
                value={company.name}
                placeholder="Halloran Build Group"
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input
                  id="city"
                  value={company.city}
                  placeholder="Denver"
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                />
              </Field>
              <Field label="State" htmlFor="state">
                <Select
                  id="state"
                  value={company.state}
                  onChange={(e) => setCompany({ ...company, state: e.target.value })}
                >
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Years in business" htmlFor="years" hint="Optional, but it earns trust quickly.">
              <Input
                id="years"
                inputMode="numeric"
                value={company.years}
                placeholder="18"
                onChange={(e) => setCompany({ ...company, years: e.target.value })}
              />
            </Field>
          </div>

          {errors.form && (
            <div role="alert" aria-live="polite" className="mt-5 rounded-md border border-bad-500/30 bg-bad-500/10 px-3.5 py-2.5 text-sm font-medium text-bad-500">
              {errors.form}
            </div>
          )}

          <Button onClick={createAccount} disabled={busy} className="mt-7 w-full">
            {busy ? "Creating your account…" : "Create account"}
          </Button>

          <p className="mt-4 text-center text-xs leading-relaxed text-ink-600">
            By creating an account you agree to the terms of service and privacy policy.
          </p>
        </>
      )}

      <p className="mt-8 text-center text-sm text-ink-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-hi-500 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
