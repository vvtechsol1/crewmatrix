"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button, Field, Input } from "@/components/form";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter the email on the account.");
      return;
    }

    setError(undefined);
    setBusy(true);
    try {
      const response = await fetch("/api/auth/account-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        setError("We could not send the reset email. Please try again shortly.");
        setBusy(false);
        return;
      }
      setSent(true);
    } catch {
      setError("We could not reach the email service. Please try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div role="status" aria-live="polite" className="mt-8 rounded-xl border border-ok-500/30 bg-ok-500/[0.07] p-6">
        <span className="grid size-9 place-items-center rounded-lg bg-ok-500/15 text-ok-500">
          <MailCheck size={18} strokeWidth={2.2} />
        </span>
        <div className="mt-3 font-medium">Check {email}</div>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          If an account exists for that address, a reset link is on its way. It expires in an hour, and using it
          signs you out everywhere else.
        </p>
        <Button variant="quiet" onClick={() => setSent(false)} className="mt-3 px-0">
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-4"
      noValidate
      onSubmit={submit}
    >
      <Field label="Email" htmlFor="reset-email" error={error}>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Sending secure link…" : "Send reset link"}
      </Button>
    </form>
  );
}
