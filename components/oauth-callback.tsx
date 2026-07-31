"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function OAuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const next = params.get("next") ?? "/dashboard/sub";

    // Supabase returns the tokens in the fragment, which never leaves the
    // browser. We hand them to the server once, and from then on the session
    // lives in an httpOnly cookie that page scripts cannot read.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");

    if (!access_token || !refresh_token) {
      queueMicrotask(() =>
        setError(hash.get("error_description") ?? "That sign-in did not complete."),
      );
      return;
    }

    (async () => {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token,
          refresh_token,
          expires_in: Number(hash.get("expires_in")) || 3600,
        }),
      });

      if (!res.ok) {
        setError("Could not complete the sign-in.");
        return;
      }

      // Clear the tokens out of the address bar before moving on.
      window.history.replaceState({}, "", window.location.pathname);
      router.replace(next);
      router.refresh();
    })();
  }, [params, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
      {error ? (
        <>
          <div className="text-lg font-medium">Sign-in did not complete</div>
          <p className="mt-2 text-sm text-ink-400">{error}</p>
          <a href="/login" className="mt-6 rounded-md bg-hi-500 px-4 py-2 text-sm font-medium text-white">
            Back to log in
          </a>
        </>
      ) : (
        <p className="text-sm text-ink-400">Finishing sign-in…</p>
      )}
    </div>
  );
}
