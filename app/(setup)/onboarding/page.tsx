import { Suspense } from "react";
import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const metadata: Metadata = {
  title: "Set up your profile — CrewMatrix",
};

export default function OnboardingPage() {
  // The role comes from the query string and is read on the client, which keeps
  // this route static — a setup wizard has nothing to render on a server.
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-5 py-14 text-sm text-ink-400">Loading…</div>}>
      <OnboardingWizard />
    </Suspense>
  );
}
