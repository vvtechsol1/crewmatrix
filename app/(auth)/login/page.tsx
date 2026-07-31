import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log in — CrewMatrix",
  description: "Sign in to manage your projects, bids and crews.",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-400">
        Log in to manage your projects, review bids and message crews.
      </p>

      <Suspense fallback={<div className="mt-8 text-sm text-ink-400">Loading…</div>}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-ink-400">
        New to CrewMatrix?{" "}
        <Link href="/signup" className="font-medium text-hi-500 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
