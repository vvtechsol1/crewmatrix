import { BadgeCheck, Bell, Search } from "lucide-react";

/**
 * A browser-framed preview of the contractor workspace — the "what you get
 * after login" shot. Drawn in CSS rather than shipped as a JPEG so it stays
 * pixel-sharp at every width and never goes stale when the product changes.
 */
export function ProductFrame() {
  return (
    <div aria-hidden className="select-none overflow-hidden rounded-2xl border border-ink-800 bg-ink-950 shadow-[0_40px_90px_-30px_rgb(14_27_51/0.25)]">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-900 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-bad-500/70" />
        <span className="size-2.5 rounded-full bg-gold-400/80" />
        <span className="size-2.5 rounded-full bg-ok-500/70" />
        <div className="mx-auto flex w-1/2 items-center justify-center gap-1.5 rounded-md bg-ink-950 px-3 py-1 text-[0.65rem] text-ink-600">
          <span className="size-1.5 rounded-full bg-ok-500" />
          crewmatrix.app/dashboard
        </div>
        <Search size={13} className="text-ink-600" />
        <Bell size={13} className="text-ink-600" />
      </div>

      <div className="grid grid-cols-[7.5rem_1fr] max-sm:grid-cols-1">
        {/* mini sidebar */}
        <div className="border-r border-ink-800 bg-ink-900/60 p-3 max-sm:hidden">
          <div className="flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded bg-hi-500 text-[0.55rem] font-bold text-white">C</span>
            <span className="font-display text-[0.7rem] font-bold">CrewMatrix</span>
          </div>
          <div className="mt-3 space-y-1">
            {["Overview", "Post a project", "Find subs", "Messages", "Settings"].map((l, i) => (
              <div
                key={l}
                className={`rounded px-2 py-1 text-[0.62rem] ${i === 0 ? "bg-hi-500/10 font-medium text-hi-500" : "text-ink-400"}`}
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* mini dashboard */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
            {[
              ["Open projects", "3"],
              ["Bids to review", "6"],
              ["Running jobs", "2"],
              ["Committed", "$312k"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-ink-800 bg-ink-900/50 px-2.5 py-2">
                <div className="text-[0.55rem] uppercase tracking-wide text-ink-600">{k}</div>
                <div className="font-display text-sm font-bold">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-ink-800">
            <div className="border-b border-ink-800 px-3 py-2 text-[0.62rem] font-medium">
              Electrical rough-in — Building C · <span className="text-ok-500">4 bids</span>
            </div>
            {[
              ["Vega Electric", "4.9", "$158,400", true],
              ["Northpeak Mechanical", "4.7", "$171,000", false],
              ["Atlas Framing", "4.4", "$176,200", false],
            ].map(([name, rating, amount, best]) => (
              <div key={name as string} className="flex items-center justify-between border-b border-ink-800 px-3 py-1.5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded bg-hi-500/10 text-[0.5rem] font-bold text-hi-500">
                    {(name as string).slice(0, 1)}
                  </span>
                  <span className="text-[0.62rem]">{name}</span>
                  <span className="flex items-center gap-0.5 text-[0.55rem] text-gold-500">★ {rating}</span>
                  {best && (
                    <span className="flex items-center gap-0.5 rounded bg-ok-500/10 px-1 py-0.5 text-[0.5rem] font-medium text-ok-500">
                      <BadgeCheck size={8} /> verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[0.65rem] font-bold">{amount}</span>
                  {best && (
                    <span className="rounded bg-hi-500 px-1.5 py-0.5 text-[0.5rem] font-medium text-white">Award</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
