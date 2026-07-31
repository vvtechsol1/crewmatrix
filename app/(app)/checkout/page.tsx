import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout — CrewMatrix",
  description: "Confirm your CrewMatrix subscription.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-5 py-10 text-sm text-ink-400">Loading…</div>}>
      <CheckoutFlow />
    </Suspense>
  );
}
