import { NextResponse } from "next/server";
import { anonKey, supabaseUrl } from "@/lib/auth";

/**
 * Hands off to Supabase's OAuth endpoint.
 *
 * Supabase handles the provider round trip and returns to /auth/callback with a
 * code. Providers have to be switched on in the Supabase dashboard first — until
 * then this returns the visitor to the login page with a reason rather than
 * bouncing them into a provider error screen.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider");
  const next = url.searchParams.get("next") ?? "/dashboard/sub";

  if (!provider || !["google", "apple"].includes(provider)) {
    return NextResponse.redirect(new URL("/login?error=unknown_provider", url.origin));
  }
  if (!supabaseUrl() || !anonKey()) {
    return NextResponse.redirect(new URL("/login?error=auth_not_configured", url.origin));
  }

  const redirectTo = new URL("/auth/callback", url.origin);
  redirectTo.searchParams.set("next", next);

  const target = new URL(`${supabaseUrl()}/auth/v1/authorize`);
  target.searchParams.set("provider", provider);
  target.searchParams.set("redirect_to", redirectTo.toString());

  return NextResponse.redirect(target);
}
