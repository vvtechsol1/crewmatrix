"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";

/**
 * Qleviq-style interactive service list: numbered rows on the left, and a
 * media panel on the right that cross-fades with a slow zoom as you hover the
 * rows. Rows slide up staggered on scroll (the global [data-reveal-child]
 * handles that); the imagery swap is local state — no scroll plumbing needed.
 */

const ITEMS = [
  {
    n: "01",
    title: "Find trusted pros",
    body: "Licence numbers and insurance expiry, checked before you spend a call on it.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=980&q=80&auto=format&fit=crop",
    alt: "Two contractors in hard hats on a steel structure",
  },
  {
    n: "02",
    title: "Post & find work",
    body: "A scope published in four steps — matched by trade and travel radius, not keyword luck.",
    img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=980&q=80&auto=format&fit=crop",
    alt: "Blueprints and drafting tools on a site desk",
  },
  {
    n: "03",
    title: "Build relationships",
    body: "Messages stay attached to the project record, so the talk and the commitment never drift apart.",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=980&q=80&auto=format&fit=crop",
    alt: "Construction site with tower crane at dusk",
  },
  {
    n: "04",
    title: "Grow your business",
    body: "Win rate, preferred crews, and milestone payouts running on the same record as the deal.",
    img: "https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?w=980&q=80&auto=format&fit=crop",
    alt: "Crew working high on a steel frame",
  },
];

export function BenefitsShowcase() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      {/* the numbered list */}
      <div data-reveal-child>
        {ITEMS.map((item, i) => (
          <button
            key={item.n}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={clsx(
              "group block w-full border-b py-6 text-left transition-colors duration-300 first:border-t",
              i === active ? "border-hi-500/40" : "border-ink-800",
            )}
          >
            <div className="flex items-baseline gap-5">
              <span
                className={clsx(
                  "font-mono text-sm font-bold transition-colors duration-300",
                  i === active ? "text-gold-500" : "text-ink-600",
                )}
              >
                {item.n}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3
                    className={clsx(
                      "font-display text-xl font-semibold transition-colors duration-300 sm:text-2xl",
                      i === active ? "text-hi-500" : "text-ink-100",
                    )}
                  >
                    {item.title}
                  </h3>
                  <span
                    className={clsx(
                      "grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300",
                      i === active
                        ? "-rotate-0 border-gold-500 bg-gold-500 text-white"
                        : "rotate-45 border-ink-700 text-ink-400 group-hover:border-ink-600",
                    )}
                  >
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                {/* body expands for the active row */}
                <div
                  className={clsx(
                    "grid transition-all duration-500",
                    i === active ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-ink-400">{item.body}</p>
                </div>
              </div>
            </div>
          </button>
        ))}

        <div className="mt-7">
          <Link
            href="/how-it-works"
            className="font-mono inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-hi-500 hover:text-hi-400"
          >
            [ View the full walkthrough ] <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* the media panel — cross-fade + slow zoom, Qleviq style */}
      <div
        data-reveal
        className="relative hidden aspect-[4/3.4] overflow-hidden rounded-3xl border border-ink-800 shadow-[0_40px_80px_-35px_rgb(14_42_92/0.35)] lg:block"
        aria-hidden
      >
        {ITEMS.map((item, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.n}
            src={item.img}
            alt=""
            width={980}
            height={840}
            loading="lazy"
            className={clsx(
              "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
              i === active ? "scale-100 opacity-100" : "scale-110 opacity-0",
            )}
          />
        ))}

        {/* navy wash + caption chip */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
            <div className="font-mono text-[0.62rem] uppercase tracking-wide text-gold-400">
              {ITEMS[active].n} / 04
            </div>
            <div className="font-display text-sm font-semibold text-white">{ITEMS[active].title}</div>
          </div>
          <div className="flex gap-1.5">
            {ITEMS.map((_, i) => (
              <span
                key={i}
                className={clsx(
                  "h-1 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-gold-400" : "w-2 bg-white/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
