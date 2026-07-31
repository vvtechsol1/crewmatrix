"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Banknote,
  Building2,
  FileText,
  HardHat,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";

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
  { href: "/dashboard/sub#payouts", label: "Payouts", Icon: Banknote },
  { href: "/messages", label: "Messages", Icon: MessageSquare },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function AppSidebar() {
  const path = usePathname();
  const isSub = path.startsWith("/dashboard/sub") || path.startsWith("/find-work");
  const nav = isSub ? subNav : contractorNav;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900/60 lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <Link href="/" className="flex items-center gap-2 px-5 py-4 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-md bg-hi-500 text-ink-950">
            <HardHat size={17} strokeWidth={2.4} />
          </span>
          CrewMatrix
        </Link>

        {/* which workspace am I in */}
        <div className="mx-3 mb-4 rounded-lg border border-ink-800 bg-ink-900 p-3">
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
            className="mt-2.5 block text-xs text-hi-500 hover:underline"
          >
            Switch to {isSub ? "contractor" : "subcontractor"} view
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((n) => {
            const active = path === n.href.split("#")[0];
            return (
              <Link
                key={n.href}
                href={n.href}
                className={clsx(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-ink-800 text-ink-100" : "text-ink-400 hover:bg-ink-800/60 hover:text-ink-100",
                )}
              >
                <n.Icon size={16} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-lg border border-ok-500/25 bg-ok-500/[0.06] p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ok-500">
            <ShieldCheck size={15} />
            Compliance current
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
            Licence and insurance both valid. Next expiry in 5 months.
          </p>
        </div>
      </div>
    </aside>
  );
}
