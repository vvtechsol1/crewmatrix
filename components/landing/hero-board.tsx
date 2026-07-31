import { BadgeCheck, Banknote, HardHat, MapPin } from "lucide-react";

/**
 * The hero's floating bid board — the product, staged in 3D.
 *
 * Pure DOM and CSS transforms: no WebGL, nothing to download, renders in the
 * static HTML and starts floating when the CSS loads. Screen readers skip it
 * entirely; the real information is in the hero copy.
 */
export function HeroBoard() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md select-none lg:max-w-none">
      <div className="board-tilt relative">
        {/* main card — the project with its bids */}
        <div className="float-a rounded-2xl border border-ink-700/80 bg-ink-900/95 p-5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-hi-500">
                Accepting bids
              </div>
              <div className="font-display mt-1.5 text-[0.95rem] font-semibold leading-snug">
                Electrical rough-in — Building C
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                <MapPin size={11} />
                Denver, CO · 8 mi
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg font-bold tracking-tight">$145–178k</div>
              <div className="text-[0.65rem] text-ink-400">9 weeks</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {[
              { name: "Vega Electric", amount: "$158,400", tone: "text-ok-500", note: "crew of 8 · Aug 17" },
              { name: "Northpeak Mechanical", amount: "$171,000", tone: "text-ink-300", note: "crew of 6 · Aug 24" },
            ].map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-950/70 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-md bg-hi-500/15 text-hi-500">
                    <HardHat size={13} />
                  </span>
                  <div>
                    <div className="text-xs font-medium">{b.name}</div>
                    <div className="text-[0.65rem] text-ink-400">{b.note}</div>
                  </div>
                </div>
                <div className={`font-display text-sm font-semibold ${b.tone}`}>{b.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* verified chip — floats above-left */}
        <div
          className="float-b absolute -left-6 -top-8 rounded-xl border border-ok-500/30 bg-ink-900/95 px-3.5 py-2.5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] sm:-left-12"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="flex items-center gap-2">
            <BadgeCheck size={15} className="text-ok-500" />
            <div>
              <div className="text-xs font-medium">Licence verified</div>
              <div className="text-[0.65rem] text-ink-400">CO-EC-55219 · exp 2027</div>
            </div>
          </div>
        </div>

        {/* payout chip — floats below-right */}
        <div
          className="float-c absolute -bottom-8 -right-4 rounded-xl border border-ink-700 bg-ink-900/95 px-3.5 py-2.5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] sm:-right-10"
          style={{ transform: "translateZ(90px)" }}
        >
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-hi-500/15 text-hi-500">
              <Banknote size={13} />
            </span>
            <div>
              <div className="text-xs font-medium">Milestone released</div>
              <div className="font-display text-sm font-semibold text-ok-500">+$40,416</div>
            </div>
          </div>
        </div>
      </div>

      {/* glow bed under the board */}
      <div className="absolute -inset-10 -z-10 rounded-full bg-hi-500/[0.07] blur-3xl" />
    </div>
  );
}
