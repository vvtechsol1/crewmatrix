import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware keeps private marketplace routes behind a valid session
 * before the page renderer runs. Row-level security remains the data boundary.
 */
const PROTECTED = [
  "/dashboard",
  "/projects",
  "/pros",
  "/find-work",
  "/find-pros",
  "/messages",
  "/settings",
  "/checkout",
  "/onboarding",
];

const isProtected = (path: string) =>
  PROTECTED.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("cl_session")?.value);

  if (isProtected(pathname) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasSession && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/sub";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/pros/:path*",
    "/find-work",
    "/find-pros",
    "/messages/:path*",
    "/settings/:path*",
    "/checkout",
    "/onboarding",
    "/login",
    "/signup",
  ],
};
