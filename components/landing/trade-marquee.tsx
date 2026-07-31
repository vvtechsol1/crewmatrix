import Link from "next/link";

const TRADES = [
  "Electrical", "Plumbing", "HVAC", "Roofing", "Concrete", "Framing",
  "Drywall", "Painting", "Flooring", "Excavation", "Landscaping", "Masonry",
];

/**
 * One slow editorial ticker on a navy band: oversized ghost type, gold diamond
 * separators, and a word lights up gold under the cursor. The list is repeated
 * four times so the loop never shows a seam; only the first copy is reachable
 * by keyboard.
 */
export function TradeMarquee() {
  const row = [...TRADES, ...TRADES, ...TRADES, ...TRADES];

  return (
    <div className="marquee overflow-hidden border-y border-navy-900 bg-navy-950 py-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="marquee-track items-center" style={{ "--marquee-duration": "60s" } as React.CSSProperties}>
        {row.map((t, i) => (
          <Link
            key={`${t}-${i}`}
            href="/signup"
            tabIndex={i < TRADES.length ? 0 : -1}
            aria-hidden={i >= TRADES.length}
            className="group flex shrink-0 items-center"
          >
            <span className="font-display whitespace-nowrap px-7 text-2xl font-bold tracking-tight text-white/25 transition-colors duration-300 group-hover:text-gold-400 sm:text-3xl">
              {t}
            </span>
            <span aria-hidden className="size-1.5 rotate-45 rounded-[1px] bg-gold-500/60" />
          </Link>
        ))}
      </div>
    </div>
  );
}
