import { Suspense } from "react";
import { OAuthCallback } from "@/components/oauth-callback";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallback />
    </Suspense>
  );
}
