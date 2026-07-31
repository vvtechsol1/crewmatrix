import Link from "next/link";
import clsx from "clsx";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  ClipboardList,
  Fan,
  Hammer,
  HardHat,
  Home,
  Layers,
  LayoutGrid,
  MessagesSquare,
  Paintbrush,
  Radar,
  Ruler,
  ShieldCheck,
  TrendingUp,
  Trees,
  Truck,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";
import { listCompanies, listProjects } from "@/lib/db";
import { ButtonLink, SectionHead } from "@/components/ui";
import { PricingPreview } from "@/components/pricing-preview";
import { BenefitsShowcase } from "@/components/landing/benefits-showcase";
import { HeroModel } from "@/components/landing/hero-model";
import { TradeMarquee } from "@/components/landing/trade-marquee";
import { HowItWorks3D } from "@/components/landing/how-it-works-3d";
import { FindWorkExperience } from "@/components/landing/find-work-experience";
import { FindProsExperience } from "@/components/landing/find-pros-experience";

/* verified, hotlink-stable Unsplash construction photography */
const HERO_IMG =
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80&auto=format&fit=crop";
const IMG = {
  findPros: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&q=80&auto=format&fit=crop",
  cta: "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=1600&q=80&auto=format&fit=crop",
};

const SHOW_HOW_IT_WORKS_3D = true;

const quickBenefits = [
  {
    Icon: ShieldCheck,
    title: "Find trusted pros",
    body: "Connect with verified subcontractors you can count on.",
  },
  {
    Icon: ClipboardList,
    title: "Post & find work",
    body: "Post projects or find opportunities that match your skills.",
  },
  {
    Icon: MessagesSquare,
    title: "Build relationships",
    body: "Network, communicate, and build long-term partnerships.",
  },
  {
    Icon: TrendingUp,
    title: "Grow your business",
    body: "Win more jobs and scale your business with CrewMatrix.",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your profile",
    body: "Sign up as a contractor or subcontractor — trades, crew size, service radius, licence and insurance.",
  },
  {
    n: "02",
    title: "Post or search projects",
    body: "Post upcoming jobs, or browse opportunities matched to your skills and service area.",
  },
  {
    n: "03",
    title: "Connect with the right pros",
    body: "Message, compare bids side by side, and build working relationships with qualified professionals.",
  },
  {
    n: "04",
    title: "Build better together",
    body: "Award the work, hold the schedule, and release milestone payouts through the platform.",
  },
];

const findWorkPillars = [
  {
    Icon: Radar,
    accent: "bg-gold-500",
    title: "Matched, not spammed",
    body: "Work is filtered by your trades and your service radius, and an alert fires the moment something inside both is posted. Nothing you cannot staff ever reaches you.",
  },
  {
    Icon: ShieldCheck,
    accent: "bg-hi-500",
    title: "Verified paperwork",
    body: "Every company profile carries its licence number and insurance expiry, checked before the first call — so the conversation starts at the job, not the basics.",
  },
  {
    Icon: MessagesSquare,
    accent: "bg-gold-500",
    title: "Deals on the record",
    body: "Message the contractor directly on the project itself, from the phone you already carry on site. The talk and the commitment never drift apart.",
  },
];

const trades = [
  { name: "Electrical", Icon: Zap },
  { name: "Plumbing", Icon: Wrench },
  { name: "HVAC", Icon: Fan },
  { name: "Roofing", Icon: Home },
  { name: "Concrete", Icon: Layers },
  { name: "Framing", Icon: Hammer },
  { name: "Drywall", Icon: LayoutGrid },
  { name: "Painting", Icon: Paintbrush },
  { name: "Flooring", Icon: Ruler },
  { name: "Excavation", Icon: Truck },
  { name: "Landscaping", Icon: Trees },
  { name: "Masonry", Icon: Warehouse },
];

export default async function HomePage() {
  const [allProjects, all] = await Promise.all([listProjects(), listCompanies()]);
  const open = allProjects.filter((p) => p.status === "open");

  // Honest numbers, straight from the live database.
  const openValue = Math.round(open.reduce((s, p) => s + (p.budgetLow + p.budgetHigh) / 2, 0) / 1000);
  const tradeCount = new Set(all.flatMap((c) => c.trades)).size;
  const verified = all.filter(
    (c) => c.license.status === "verified" && c.insurance.status === "verified",
  ).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "CrewMatrix",
        url: "https://crewmatrix.vvtechsol1.workers.dev",
        description:
          "Construction bidding marketplace connecting general contractors with licensed subcontractors.",
      },
      {
        "@type": "SoftwareApplication",
        name: "CrewMatrix",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "General contractors post construction projects; licensed subcontractors bid on radius-matched work across 12 trades. Licence and insurance verification, in-project messaging and milestone payouts.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ==================== hero — dusk site, navy + gold ============== */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMG}
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/80 to-navy-900/40"
        />
        {/* dusk warmth on the horizon, like the site at golden hour */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_78%_72%,rgb(245_179_1/0.22),transparent_65%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent"
        />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl items-center px-5 pb-28 pt-32">
          <div className="max-w-2xl text-white">
            <div
              data-reveal
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-mono text-xs font-medium text-white/85 backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-gold-400" />
              {open.length} projects accepting bids right now
            </div>

            <h1 className="text-display-xl mt-6">
              <span data-split className="block">
                Build better.
              </span>
              <span data-split data-split-delay="0.28" className="accent-gold block">
                Together.
              </span>
            </h1>

            <p data-reveal data-reveal-delay="0.45" className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              CrewMatrix is the construction bidding platform where general contractors post projects and licensed
              subcontractors win work nearby — radius-matched bids across 12 trades, verified paperwork, and the
              payout on the same record as the deal.
            </p>

            <div data-reveal data-reveal-delay="0.55" className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/#find-contractors"
                className="inline-flex items-center rounded-md bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-100 transition-colors hover:bg-gold-400"
              >
                Find subcontractors <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Post a project
              </Link>
            </div>

            <dl
              data-reveal
              data-reveal-delay="0.65"
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-5 backdrop-blur"
            >
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-white/60">Open work</dt>
                <dd
                  className="font-display mt-1 text-2xl font-bold tracking-tight text-gold-400"
                  data-counter={openValue}
                  data-prefix="$"
                  data-suffix="k"
                >
                  $0k
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-white/60">Trades</dt>
                <dd className="font-display mt-1 text-2xl font-bold tracking-tight text-gold-400" data-counter={tradeCount}>
                  0
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-wide text-white/60">Verified companies</dt>
                <dd className="font-display mt-1 text-2xl font-bold tracking-tight text-gold-400" data-counter={verified}>
                  0
                </dd>
              </div>
            </dl>
          </div>

          {/* 3D diorama + floating product chips, desktop only */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[32rem] lg:block">
            <HeroModel />
            <div className="float-b absolute right-10 top-[24%] rounded-xl border border-white/20 bg-white/95 px-3.5 py-2.5 shadow-xl">
              <div className="flex items-center gap-2">
                <BadgeCheck size={15} className="text-ok-500" />
                <div>
                  <div className="text-xs font-medium text-ink-100">Licence verified</div>
                  <div className="font-mono text-[0.62rem] text-ink-600">CO-EC-55219 · exp 2027</div>
                </div>
              </div>
            </div>
            <div className="float-c absolute right-0 top-[48%] rounded-xl border border-white/20 bg-white/95 px-3.5 py-2.5 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-gold-500/20 text-gold-600">
                  <Banknote size={13} />
                </span>
                <div>
                  <div className="text-xs font-medium text-ink-100">Milestone released</div>
                  <div className="font-display text-sm font-bold text-ok-500">+$40,416</div>
                </div>
              </div>
            </div>
            <div className="float-a absolute right-16 top-[68%] rounded-xl border border-white/20 bg-white/95 px-3.5 py-2.5 shadow-xl">
              <div className="flex items-center gap-1.5 text-xs font-medium text-ink-100">
                <span className="text-gold-500">★ 4.9</span> Vega Electric · crew of 9
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ quick benefits — card overlapping the hero ========== */}
      <section className="relative z-10 -mt-20 px-5">
        <div
          data-reveal
          className="mx-auto max-w-6xl rounded-3xl border border-ink-800 bg-white p-8 shadow-[0_40px_80px_-30px_rgb(14_42_92/0.3)] sm:p-10"
        >
          <div
            data-reveal-row
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-ink-800"
          >
            {quickBenefits.map((b, i) => (
              <div key={b.title} className={clsx("lg:px-8", i === 0 && "lg:pl-0", i === 3 && "lg:pr-0")}>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-hi-500/10 text-hi-500">
                    <b.Icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className="font-display font-semibold">{b.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-400">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ marquee ============================= */}
      <section className="mt-16">
        <TradeMarquee />
      </section>

      {/* ====== benefits + product shot — glass panel on a colour field ==== */}
      <section className="relative overflow-hidden py-24">
        {/* the colour field the glass sits on */}
        <div aria-hidden className="bg-blueprint absolute inset-0" />
        <div aria-hidden className="absolute -left-40 top-16 size-[26rem] rounded-full bg-hi-500/15 blur-3xl" />
        <div aria-hidden className="absolute -right-32 bottom-10 size-[30rem] rounded-full bg-gold-400/20 blur-3xl" />
        <div aria-hidden className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hi-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5">
          {/* frosted glass panel */}
          <div className="rounded-[2rem] border border-white/60 bg-white/55 p-7 shadow-[0_50px_100px_-45px_rgb(14_42_92/0.4)] backdrop-blur-2xl sm:p-12">
            <div data-reveal>
              <SectionHead
                eyebrow="Why CrewMatrix"
                title="Everything a job needs,"
                accent="on one record"
                accentOnNewLine
                sub="Profiles, projects, bids, messages and money — connected, so nothing gets lost between a phone call and a spreadsheet."
              />
            </div>

            <div className="mt-12">
              <BenefitsShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ============== how it works — scroll-built 3D site =============== */}
      {SHOW_HOW_IT_WORKS_3D ? <HowItWorks3D steps={steps} /> : null}

      {/* ============ find work — dark feature card (Qleviq style) ======== */}
      <FindWorkExperience openCount={open.length} />
      <section id="find-work-legacy" className="hidden" aria-hidden="true">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div
            data-reveal
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-[#122f6b] p-8 shadow-[0_50px_100px_-40px_rgb(10_28_64/0.6)] sm:p-12 lg:p-16"
          >
            {/* faint blueprint lines inside the card */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-gold-500/10 blur-3xl"
            />

            <div className="relative">
              <span className="inline-flex items-center rounded-md bg-hi-500 px-3 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white">
                For subcontractors
              </span>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
                <h2 data-cascade className="text-display-lg max-w-xl text-white">
                  Find your next opportunity
                </h2>
                <p className="max-w-md leading-relaxed text-white/60">
                  Browse construction projects from contractors actively hiring skilled trades — matched to what
                  you do and how far you travel.
                </p>
              </div>

              <div data-reveal-child className="mt-12 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-3 md:gap-0">
                {findWorkPillars.map((p, i) => (
                  <div
                    key={p.title}
                    className={clsx(
                      "group relative md:px-8",
                      i === 0 && "md:pl-0",
                      i === 2 && "md:pr-0",
                      i > 0 && "md:border-l md:border-white/10",
                    )}
                  >
                    {/* accent tick above each column */}
                    <span className={`absolute -top-10 left-0 hidden h-0.5 w-10 rounded md:block ${p.accent}`} />
                    <span className="grid size-12 place-items-center rounded-xl border border-white/15 bg-white/[0.06] text-white/85 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold-500/50 group-hover:text-gold-400">
                      <p.Icon size={21} strokeWidth={1.8} />
                    </span>
                    <h3 className="font-display mt-5 text-lg font-semibold text-white">{p.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/60">{p.body}</p>
                  </div>
                ))}
              </div>

              <div data-reveal className="mt-12 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-md bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-100 transition-colors hover:bg-gold-400"
                >
                  Browse jobs <ArrowRight size={16} className="ml-2" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Create a profile
                </Link>
                <span className="font-mono text-xs text-white/50">
                  {open.length} projects open right now
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= find contractors ======================= */}
      <FindProsExperience />
      <section id="find-contractors-legacy" className="hidden" aria-hidden="true">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
          <div>
            <div data-reveal>
              <SectionHead
                eyebrow="For general contractors"
                title="Find qualified subcontractors,"
                accent="fast"
                sub="Search trusted professionals across the trades below — licence and insurance status shown before the first call."
              />
            </div>

            <div data-reveal-child className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {trades.map((t) => (
                <Link
                  key={t.name}
                  href="/signup"
                  className="group flex items-center gap-2.5 rounded-xl border border-ink-800 bg-ink-950 px-3.5 py-3 transition-colors hover:border-hi-500/40"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-hi-500/10 text-hi-500 transition-colors group-hover:bg-gold-500/15 group-hover:text-gold-600">
                    <t.Icon size={15} strokeWidth={2.2} />
                  </span>
                  <span className="text-sm font-medium">{t.name}</span>
                </Link>
              ))}
            </div>

            <div data-reveal className="mt-8">
              <ButtonLink href="/signup">
                Find subcontractors <ArrowRight size={16} className="ml-2" />
              </ButtonLink>
            </div>
          </div>

          <div data-reveal className="relative">
            <div className="overflow-hidden rounded-2xl border border-ink-800 shadow-[0_30px_70px_-30px_rgb(14_27_51/0.3)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG.findPros}
                alt="Two contractors in hard hats reviewing work on a steel structure"
                width={1000}
                height={750}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div
              aria-hidden
              className="absolute -top-5 right-6 rounded-xl border border-ink-800 bg-ink-950/95 px-3.5 py-2.5 shadow-lg backdrop-blur"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className="text-gold-500">★ 4.9</span> Vega Electric · crew of 9
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ pricing ============================= */}
      <section
        id="pricing"
        className="relative scroll-mt-20 overflow-hidden border-y border-ink-800 bg-[radial-gradient(circle_at_50%_0%,rgba(38,73,216,.09),transparent_38%),linear-gradient(180deg,#fff_0%,#f6f8fc_100%)]"
      >
        <div className="pointer-events-none absolute left-[8%] top-24 size-48 rounded-full bg-hi-500/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 right-[8%] size-56 rounded-full bg-[#ffc43d]/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-28">
          <div data-cascade-done="1" className="pricing-heading-lock text-center">
            <style>{`
              .pricing-heading-lock > div {
                margin-inline: auto;
              }
              .pricing-heading-lock h2 {
                transform: none !important;
                opacity: 1 !important;
                clip-path: none !important;
              }
            `}</style>
            <SectionHead
              eyebrow="Pricing"
              title="Simple pricing."
              accent="Built for real crews."
              accentOnNewLine
              sub="Start free, upgrade when your workload grows. No lead fees, no per-bid charges, and no surprises."
            />
          </div>
          <div data-cascade-done="1" className="mt-10 sm:mt-12">
            <PricingPreview />
          </div>
        </div>
      </section>

      {/* ========================= stats band (blue) ====================== */}
      <section className="bg-hi-600 text-white">
        <div data-reveal-child className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 text-center sm:grid-cols-4">
          {[
            { label: "Open work", value: openValue, prefix: "$", suffix: "k" },
            { label: "Trades covered", value: tradeCount, suffix: "+" },
            { label: "Verified companies", value: verified },
            { label: "Projects posted", value: allProjects.length },
          ].map((s) => (
            <div key={s.label}>
              <div
                className="font-display text-3xl font-bold tracking-tight text-gold-400"
                data-counter={s.value}
                data-prefix={s.prefix ?? ""}
                data-suffix={s.suffix ?? ""}
              >
                0
              </div>
              <div className="mt-1 text-sm text-white/75">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ final cta =========================== */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG.cta}
          alt=""
          aria-hidden
          width={1600}
          height={900}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hi-600/95 via-hi-600/85 to-hi-500/75" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-5 py-28 text-center text-white">
          <h2 data-cascade className="text-display-lg mx-auto max-w-2xl">
            Ready to build better, together?
          </h2>
          <p data-reveal data-reveal-delay="0.1" className="mx-auto mt-5 max-w-xl leading-relaxed text-white/85">
            Join contractors and subcontractors using CrewMatrix to fill labour gaps, win more work and get paid on
            time.
          </p>
          <div data-reveal data-reveal-delay="0.2" className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              style={{ backgroundColor: "#ffc43d", color: "#0e1b33" }}
              className="inline-flex items-center rounded-md border border-[#ffc43d] px-5 py-2.5 text-sm font-bold shadow-[0_10px_28px_rgba(255,196,61,.24)] transition-all hover:-translate-y-0.5 hover:bg-[#ffd15c]"
            >
              Get started free <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
          <p data-reveal data-reveal-delay="0.3" className="mt-5 flex items-center justify-center gap-2 text-sm text-white/70">
            <HardHat size={14} /> Free to list and bid. No card until you subscribe.
          </p>
        </div>
      </section>
    </>
  );
}
