"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { MobileNav } from "@/components/mobile-nav";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#find-work", label: "Find work" },
  { href: "/#find-contractors", label: "Find contractors" },
  { href: "/#pricing", label: "Pricing" },
];

/**
 * The nav rides on top of the hero: transparent with white text while the navy
 * photo is behind it, then solidifies to frosted white the moment you scroll.
 * On inner pages (white backgrounds) it is always solid, plus a spacer so
 * content does not slide underneath.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = pathname === "/" && !scrolled;

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          overHero
            ? // a scrim fading into the hero, so the links always sit on dark
              "border-b border-transparent bg-gradient-to-b from-navy-950/90 via-navy-950/50 to-transparent pb-3"
            : "border-b border-ink-800 bg-ink-950/85 shadow-sm backdrop-blur",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <BrandLogo
              priority
              imageClassName="size-10"
              textClassName={clsx("text-lg transition-colors", overHero ? "text-white" : "text-ink-100")}
            />
          </Link>

          <nav className="ml-2 hidden gap-1 text-sm lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={overHero ? { color: "#ffffff" } : undefined}
                className={clsx(
                  "inline-flex min-h-11 items-center rounded-md px-3 py-1.5 font-medium transition-colors",
                  overHero
                    ? "hover:bg-white/15"
                    : "text-ink-300 hover:bg-ink-800 hover:text-ink-100",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link
              href="/login"
              style={overHero ? { color: "#ffffff" } : undefined}
              className={clsx(
                "hidden min-h-11 items-center rounded-md px-3 py-1.5 font-medium transition-colors sm:inline-flex",
                overHero
                  ? "hover:bg-white/15"
                  : "text-ink-300 hover:bg-ink-800 hover:text-ink-100",
              )}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="min-h-11 items-center rounded-md bg-gold-500 px-4 py-1.5 font-semibold text-ink-100 transition-colors hover:bg-gold-400 sm:inline-flex"
            >
              Sign up free
            </Link>
            <MobileNav light={overHero} />
          </div>
        </div>
      </header>

      {/* inner pages start below the fixed bar; the landing hero rides under it */}
      {pathname !== "/" && <div className="h-[3.75rem]" />}
    </>
  );
}
