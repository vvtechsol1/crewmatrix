import Link from "next/link";
import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const marketplaceLinks = [
  { href: "/find-work", label: "Find work" },
  { href: "/find-pros", label: "Find contractors" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

const accountLinks = [
  { href: "/signup", label: "Create an account" },
  { href: "/login", label: "Log in" },
  { href: "/dashboard/contractor", label: "Contractor workspace" },
  { href: "/dashboard/sub", label: "Subcontractor workspace" },
];

export function SiteFooter() {
  return (
    <footer id="site-footer" className="relative overflow-hidden bg-navy-950 text-white">
      <style>{`
        .site-footer-layout {
          display: grid;
          grid-template-columns: 1.35fr 0.75fr 0.9fr;
        }
        @media (max-width: 1023px) {
          .site-footer-layout {
            grid-template-columns: 1.25fr 0.75fr;
          }
          .site-footer-layout > :first-child {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 639px) {
          .site-footer-layout {
            grid-template-columns: 1fr;
          }
          .site-footer-layout > :first-child {
            grid-column: auto;
          }
        }
      `}</style>
      <div className="h-1 bg-gradient-to-r from-hi-500 via-gold-500 to-hi-500" />
      <div className="pointer-events-none absolute -left-32 top-10 size-80 rounded-full bg-hi-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="site-footer-layout relative mx-auto max-w-6xl gap-12 px-5 py-14 sm:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="CrewMatrix home">
            <BrandLogo imageClassName="size-12" textClassName="text-xl" />
          </Link>

          <p className="mt-5 max-w-md text-[15px] leading-7 text-white/65">
            The construction marketplace where qualified crews meet serious projects,
            agree the work, and keep every commitment on one record.
          </p>

          <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 backdrop-blur">
            <span className="grid size-9 place-items-center rounded-xl bg-ok-500/15 text-[#5de2a7]">
              <ShieldCheck size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">Built for trusted work</span>
              <span className="mt-0.5 block text-xs text-white/50">Verified profiles · Secure payouts</span>
            </span>
          </div>
        </div>

        <FooterLinks title="Marketplace" links={marketplaceLinks} />
        <FooterLinks title="Your account" links={accountLinks} />
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CrewMatrix. Built for construction professionals.</p>
          <p className="flex items-center gap-2">
            <Check size={14} className="text-[#5de2a7]" />
            Licences and insurance checked before a company can bid.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="font-mono text-[11px] font-bold uppercase tracking-[.2em] text-gold-400">
        {title}
      </h2>
      <ul className="mt-5 space-y-3.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors hover:text-white"
            >
              {link.label}
              <ArrowUpRight
                size={13}
                className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
