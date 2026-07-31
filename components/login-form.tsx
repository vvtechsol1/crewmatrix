"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, ButtonSpinner, Field, Input } from "@/components/form";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const v: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) v.email = "Enter the email you signed up with.";
    if (password.length < 8) v.password = "Passwords are at least 8 characters.";
    setErrors(v);
    if (Object.keys(v).length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setErrors({ form: data.error ?? "Could not sign you in." });
        setBusy(false);
        return;
      }

      // Back to whatever they were trying to reach before the guard stopped them.
      router.push(next ?? "/dashboard/sub");
      router.refresh();
    } catch {
      setErrors({ form: "Network problem — try again." });
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-8 grid gap-3">
        <Button
          variant="ghost"
          onClick={() =>
            (window.location.href = `/api/auth/oauth?provider=google&next=${encodeURIComponent(next ?? "/dashboard/sub")}`)
          }
        >
          <GoogleMark />
          Continue with Google
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            (window.location.href = `/api/auth/oauth?provider=apple&next=${encodeURIComponent(next ?? "/dashboard/sub")}`)
          }
        >
          <AppleMark />
          Continue with Apple
        </Button>
      </div>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-ink-800" />
        <span className="text-xs uppercase tracking-wide text-ink-600">or</span>
        <div className="h-px flex-1 bg-ink-800" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && (
          <div role="alert" aria-live="polite" className="rounded-md border border-bad-500/30 bg-bad-500/10 px-3.5 py-2.5 text-sm font-medium text-bad-500">
            {errors.form}
          </div>
        )}

        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-400">
            <input type="checkbox" defaultChecked className="size-4 accent-hi-500" />
            Keep me signed in
          </label>
          <Link href="/forgot-password" className="text-hi-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={busy} aria-busy={busy} className="w-full">
          {busy && <ButtonSpinner />}
          {busy ? "Signing in…" : "Log in"}
        </Button>
      </form>
    </>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.6 24 12 24z" />
      <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.6 0 3.7 2.6 1.8 6.1l3.8 3c.9-2.7 3.4-4.3 6.4-4.3z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M16.4 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.2-1.2 3.1-2.4.7-1 1-2 1.1-2.1-.1 0-2.3-.9-2.3-3.4zM14 4.5c.7-.8 1.1-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3.1 1.1.1 2.2-.6 2.9-1.4z" />
    </svg>
  );
}
