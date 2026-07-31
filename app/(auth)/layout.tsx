import Link from "next/link";
import { ShieldCheck, Timer, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const points = [
  { Icon: Users, text: "Contractors and crews across 12 trades" },
  { Icon: ShieldCheck, text: "Licence and insurance checked against an expiry date" },
  { Icon: Timer, text: "Bids arrive with a price and an honest start date" },
];

const ASIDE_IMG =
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=75&auto=format&fit=crop";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left: the form */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-ink-800 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <BrandLogo imageClassName="size-9" />
          </Link>
          <Link href="/" className="text-sm text-ink-400 hover:text-ink-100">
            Back to site
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>

      {/* right: photography with the pitch over it */}
      <aside className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASIDE_IMG}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-hi-600/95 via-hi-600/70 to-hi-600/40" aria-hidden />

        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <h2 className="text-display-md max-w-md">Build better. Together.</h2>
          <p className="mt-3 max-w-md leading-relaxed text-white/80">
            The marketplace connecting general contractors with trusted subcontractors — with the paperwork and
            the payout on the same record.
          </p>

          <ul className="mt-7 space-y-3">
            {points.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-sm text-white/90">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-gold-400/25 text-gold-400">
                  <p.Icon size={13} strokeWidth={2.4} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-white/20 pt-5 text-xs text-white/60">
            © {new Date().getFullYear()} CrewMatrix
          </div>
        </div>
      </aside>
    </div>
  );
}
