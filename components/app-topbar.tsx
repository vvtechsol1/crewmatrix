"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BrandLogo } from "@/components/brand-logo";
import {
  Banknote,
  Bell,
  Building2,
  FileText,
  HardHat,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard/contractor": "Overview",
  "/dashboard/sub": "Overview",
  "/projects/new": "Post a project",
  "/messages": "Messages",
  "/settings": "Settings",
  "/settings/billing": "Billing",
  "/settings/payouts": "Payouts",
  "/settings/team": "Team",
  "/checkout": "Checkout",
};

const contractorNav = [
  { href: "/dashboard/contractor", label: "Overview", Icon: LayoutDashboard },
  { href: "/projects/new", label: "Post a project", Icon: Plus },
  { href: "/find-pros", label: "Find subcontractors", Icon: Search },
  { href: "/messages", label: "Messages", Icon: MessageSquare },
  { href: "/settings", label: "Settings", Icon: Settings },
];

const subNav = [
  { href: "/dashboard/sub", label: "Overview", Icon: LayoutDashboard },
  { href: "/find-work", label: "Find work", Icon: Search },
  { href: "/dashboard/sub#bids", label: "My bids", Icon: FileText },
  { href: "/settings/payouts", label: "Payouts", Icon: Banknote },
  { href: "/messages", label: "Messages", Icon: MessageSquare },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function AppTopbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isSub = path.startsWith("/dashboard/sub") || path.startsWith("/find-work");
  const nav = isSub ? subNav : contractorNav;
  const title = titles[path] ?? (path.startsWith("/projects/") ? "Project" : "Workspace");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const items = () =>
      Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    items()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = items();
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
        <div className="flex items-center gap-3 px-5 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <BrandLogo imageClassName="size-8" showText={false} />
          </Link>

          <button
            ref={menuButtonRef}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="workspace-mobile-menu"
            className="grid size-11 place-items-center rounded-md text-ink-400 hover:bg-ink-800 hover:text-ink-100 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="text-sm font-medium">{title}</div>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href={isSub ? "/find-work" : "/find-pros"}
              className="grid size-11 place-items-center rounded-md text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              aria-label={isSub ? "Find work" : "Find subcontractors"}
              title={isSub ? "Find work" : "Find subcontractors"}
            >
              <Search size={17} />
            </Link>
            <Link
              href="/messages"
              className="relative grid size-11 place-items-center rounded-md text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              aria-label="Messages and notifications"
              title="Messages and notifications"
            >
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-hi-500" />
            </Link>
            <Link
              href="/settings"
              className="ml-1 grid size-8 place-items-center rounded-full bg-ink-800 text-xs font-medium text-ink-300"
            >
              {isSub ? "LV" : "DH"}
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="ml-1 grid size-11 place-items-center rounded-md text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            aria-hidden="true"
            onClick={() => {
              setOpen(false);
              menuButtonRef.current?.focus();
            }}
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
          />

          <div
            ref={drawerRef}
            id="workspace-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace menu"
            className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-ink-800 bg-ink-900"
          >
            <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4">
              <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                <BrandLogo imageClassName="size-9" />
              </Link>
              <button onClick={() => { setOpen(false); menuButtonRef.current?.focus(); }} aria-label="Close menu" className="grid size-11 place-items-center rounded-md hover:bg-ink-800">
                <X size={19} className="text-ink-400" />
              </button>
            </div>

            <div className="mx-3 mt-4 rounded-lg border border-ink-800 bg-ink-950 p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-ink-800 text-ink-300">
                  {isSub ? <HardHat size={14} /> : <Building2 size={14} />}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {isSub ? "Vega Electric" : "Halloran Build Group"}
                  </div>
                  <div className="text-xs text-ink-400">{isSub ? "Subcontractor" : "General contractor"}</div>
                </div>
              </div>
              <Link
                href={isSub ? "/dashboard/contractor" : "/dashboard/sub"}
                onClick={() => setOpen(false)}
                className="mt-2.5 block text-xs text-hi-500"
              >
                Switch to {isSub ? "contractor" : "subcontractor"} view
              </Link>
            </div>

            <nav className="mt-3 flex-1 space-y-0.5 px-3">
              {nav.map((n) => {
                const active = !n.href.includes("#") && path === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex items-center gap-2.5 rounded-md px-3 py-3 text-sm transition-colors",
                      active ? "bg-ink-800 text-ink-100" : "text-ink-400 hover:bg-ink-800/60 hover:text-ink-100",
                    )}
                  >
                    <n.Icon size={16} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
