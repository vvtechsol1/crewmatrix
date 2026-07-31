"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button, Field, Input } from "@/components/form";

export function ResetPasswordForm() {
  const [accessToken, setAccessToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = hash.get("access_token");
    const linkError = hash.get("error_description");
    const recoveryToken = !linkError && token && hash.get("type") === "recovery" ? token : "";
    const initialError = linkError || (!recoveryToken ? "This reset link is invalid or has expired." : undefined);
    window.history.replaceState({}, "", window.location.pathname);
    queueMicrotask(() => {
      if (recoveryToken) setAccessToken(recoveryToken);
      if (initialError) setError(initialError);
      setReady(true);
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    setError(undefined);
    setBusy(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "The password could not be changed.");
        return;
      }
      setDone(true);
    } catch {
      setError("The authentication service is unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="mt-8 text-sm text-ink-400">Checking your secure link…</p>;

  if (done) {
    return (
      <div role="status" aria-live="polite" className="mt-8 rounded-xl border border-ok-500/30 bg-ok-500/[0.07] p-6">
        <span className="grid size-9 place-items-center rounded-lg bg-ok-500/15 text-ok-500">
          <CheckCircle2 size={18} />
        </span>
        <div className="mt-3 font-medium">Password changed</div>
        <p className="mt-2 text-sm text-ink-300">Your new password is active. Sign in again to continue securely.</p>
        <Link href="/login" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-hi-500 px-4 py-2 text-sm font-semibold text-white hover:bg-hi-400">
          Continue to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-4">
      {error && (
        <div role="alert" aria-live="polite" className="rounded-md border border-bad-500/30 bg-bad-500/10 px-3.5 py-2.5 text-sm font-medium text-bad-500">
          {error}
        </div>
      )}
      {accessToken && (
        <>
          <Field label="New password" htmlFor="new-password" hint="At least 8 characters.">
            <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-password">
            <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </Field>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Saving new password…" : "Set new password"}
          </Button>
        </>
      )}
      {!accessToken && (
        <Link href="/forgot-password" className="inline-flex min-h-11 items-center text-sm font-medium text-hi-500 hover:underline">
          Request a new reset link
        </Link>
      )}
    </form>
  );
}
