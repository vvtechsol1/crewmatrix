"use client";

import { useState } from "react";

export function ConnectButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "unavailable">("idle");

  async function start() {
    setState("loading");
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setState("unavailable");
    } catch {
      setState("unavailable");
    }
  }

  return (
    <div>
      <button
        onClick={start}
        disabled={state === "loading"}
        className="w-full rounded-md border border-ink-700 px-4 py-2 text-sm font-medium transition-colors hover:bg-ink-800 disabled:opacity-60"
      >
        {state === "loading" ? "Opening Stripe…" : "Set up payouts"}
      </button>
      {state === "unavailable" && (
        <p className="mt-2 text-xs text-warn-500">
          Connect keys are not configured on this deployment. Set STRIPE_SECRET_KEY to enable onboarding.
        </p>
      )}
    </div>
  );
}
