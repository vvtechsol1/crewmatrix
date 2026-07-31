"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/settings", label: "Company" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/payouts", label: "Payouts" },
  { href: "/settings/team", label: "Team" },
];

export function SettingsTabs() {
  const path = usePathname();

  return (
    <div className="mt-6 flex gap-1 overflow-x-auto border-b border-ink-800">
      {tabs.map((t) => {
        const active = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors",
              active
                ? "border-hi-500 font-medium text-ink-100"
                : "border-transparent text-ink-400 hover:text-ink-100",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
