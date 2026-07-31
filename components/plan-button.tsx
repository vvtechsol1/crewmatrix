"use client";

import { useState } from "react";
import clsx from "clsx";
import type { PlanTier } from "@/lib/types";

export function PlanButton({ plan }: { plan: PlanTier }) {
  const [state, setState] = useState<"idle" | "loading" | "unavailable">("idle");

  async function start() {
    if (plan.priceMonthly === 0) {
      window.location.href = "/find-work";
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = (await res.json()) as { url?: string; reason?: string };

      if (!res.ok || !data.url) {
        setState("unavailable");
        return;
      }
      window.location.href = data.url;
    } catch {
      setState("unavailable");
    }
  }

  return (
    <div>
      <button
        onClick={start}
        disabled={state === "loading"}
        className={clsx(
          "min-h-11 w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors",
          plan.featured
            ? "bg-hi-500 text-ink-950 hover:bg-hi-400"
            : "border border-ink-700 text-ink-100 hover:bg-ink-800",
          state === "loading" && "opacity-60",
        )}
      >
        {state === "loading"
          ? "Opening checkout…"
          : plan.priceMonthly === 0
            ? "Start free"
            : `Choose ${plan.name}`}
      </button>

      {state === "unavailable" && (
        <p role="alert" className="mt-2 text-xs font-medium text-warn-500">
          Secure checkout is temporarily unavailable. Please try again shortly.
        </p>
      )}
    </div>
  );
}
