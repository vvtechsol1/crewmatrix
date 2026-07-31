import clsx from "clsx";
import Link from "next/link";
import { BadgeCheck, Clock3, ShieldAlert, ShieldX, Star } from "lucide-react";
import type { Company, VerificationStatus } from "@/lib/types";
import { initials } from "@/lib/format";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("rounded-xl border border-ink-800 bg-ink-900", className)}>{children}</div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  accent,
  accentOnNewLine = false,
  sub,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  /** trailing words rendered in gold — the royal blue / gold two-tone */
  accent?: string;
  accentOnNewLine?: boolean;
  sub?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <div className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-gold-600">
          {eyebrow}
        </div>
      )}
      <Heading data-cascade className="text-display-lg mt-3 text-hi-500">
        {title}
        {accent && (
          <span className={clsx("text-gold-600", accentOnNewLine && "block")}>
            {accentOnNewLine ? accent : ` ${accent}`}
          </span>
        )}
      </Heading>
      {sub && <p className="mt-4 text-ink-400">{sub}</p>}
    </div>
  );
}

export function Avatar({ company, size = 40 }: { company: Company; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg font-semibold text-ink-950"
      style={{ width: size, height: size, background: company.accent, fontSize: size * 0.38 }}
    >
      {initials(company.name)}
    </span>
  );
}

const verifyMap: Record<VerificationStatus, { label: string; cls: string; Icon: typeof BadgeCheck }> = {
  verified: { label: "Verified", cls: "text-ok-500 border-ok-500/30 bg-ok-500/10", Icon: BadgeCheck },
  pending: { label: "In review", cls: "text-warn-500 border-warn-500/30 bg-warn-500/10", Icon: Clock3 },
  expired: { label: "Expired", cls: "text-bad-500 border-bad-500/30 bg-bad-500/10", Icon: ShieldAlert },
  none: { label: "Not supplied", cls: "text-ink-400 border-ink-700 bg-ink-800", Icon: ShieldX },
};

export function VerifyBadge({ status, label }: { status: VerificationStatus; label: string }) {
  const v = verifyMap[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        v.cls,
      )}
    >
      <v.Icon size={13} strokeWidth={2.3} />
      {label}: {v.label}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "ok" | "warn" | "bad";
}) {
  const tones = {
    neutral: "border-ink-700 bg-ink-800 text-ink-300",
    accent: "border-hi-500/30 bg-hi-500/10 text-hi-500",
    ok: "border-ok-500/30 bg-ok-500/10 text-ok-500",
    warn: "border-warn-500/30 bg-warn-500/10 text-warn-500",
    bad: "border-bad-500/30 bg-bad-500/10 text-bad-500",
  } as const;
  return (
    <span className={clsx("inline-flex rounded-md border px-2 py-0.5 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function Rating({ value, count }: { value: number; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-ink-300">
      <Star size={14} className="fill-gold-500 text-gold-500" />
      <span className="font-medium text-ink-100">{value.toFixed(1)}</span>
      <span className="text-ink-400">({count})</span>
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-ink-400">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </Card>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
        variant === "primary"
          ? "bg-hi-500 text-ink-950 hover:bg-hi-400"
          : "border border-ink-700 text-ink-100 hover:bg-ink-800",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <Card className="p-10 text-center">
      <div className="font-medium">{title}</div>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">{sub}</p>
    </Card>
  );
}
