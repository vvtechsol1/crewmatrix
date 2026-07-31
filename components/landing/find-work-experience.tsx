"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  HardHat,
  MapPin,
  MessagesSquare,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Radar,
    title: "Matched, not spammed",
    label: "Smart radius matching",
    body: "Your trades, crew capacity and travel radius filter every opportunity before it reaches you.",
  },
  {
    Icon: ShieldCheck,
    title: "Verified paperwork",
    label: "Ready before the call",
    body: "Licence and insurance details travel with your profile, so the first conversation starts at the job.",
  },
  {
    Icon: MessagesSquare,
    title: "Deals on the record",
    label: "Context never gets lost",
    body: "Messages stay attached to the project, bid and schedule that gave them meaning.",
  },
];

export function FindWorkExperience({ openCount }: { openCount: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    if (!sectionRef.current || !sceneRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const scene = sceneRef.current;
    const media = gsap.matchMedia();
    let observer: ReturnType<typeof ScrollTrigger.observe> | undefined;

    const context = gsap.context(() => {
      gsap.from("[data-fw-enter]", {
        y: 35,
        opacity: 0,
        duration: 0.85,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-fw-title]", start: "top 85%", once: true },
      });
      gsap.from("[data-tower]", {
        scaleY: 0.08,
        y: 70,
        transformOrigin: "50% 100%",
        duration: 1,
        stagger: 0.1,
        ease: "back.out(1.35)",
        scrollTrigger: { trigger: section, start: "top 65%", once: true },
      });
      gsap.to("[data-orbit]", { rotate: 360, duration: 24, repeat: -1, ease: "none" });
      gsap.to("[data-float]", {
        y: (index) => (index % 2 ? 10 : -10),
        duration: (index) => 2.8 + index * 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-glow='blue']", {
        xPercent: 28,
        yPercent: -16,
        scale: 1.2,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-glow='gold']", {
        xPercent: -22,
        yPercent: 20,
        scale: 0.82,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      media.add(
        {
          interactive: "(min-width: 900px) and (pointer: fine)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (mediaContext) => {
          if (!mediaContext.conditions?.interactive || mediaContext.conditions.reduce) return;

          const tiltX = gsap.quickTo(scene, "rotationX", { duration: 0.7, ease: "power3.out" });
          const tiltY = gsap.quickTo(scene, "rotationY", { duration: 0.7, ease: "power3.out" });
          const onMove = (event: PointerEvent) => {
            const bounds = section.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            tiltY(x * 13);
            tiltX(-y * 9);
          };
          const onLeave = () => {
            tiltX(0);
            tiltY(0);
          };
          section.addEventListener("pointermove", onMove);
          section.addEventListener("pointerleave", onLeave);

          gsap.to("[data-scene-core]", {
            rotationY: 22,
            z: 50,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          });

          let wheelAngle = 0;
          const rotateFromWheel = gsap.quickTo("[data-scene-core]", "rotationZ", {
            duration: 1,
            ease: "power3.out",
          });
          observer = ScrollTrigger.observe({
            target: section,
            type: "wheel",
            debounce: true,
            onChangeY: (self) => {
              wheelAngle += gsap.utils.clamp(-5, 5, self.deltaY * 0.012);
              rotateFromWheel(wheelAngle);
            },
          });

          return () => {
            observer?.kill();
            section.removeEventListener("pointermove", onMove);
            section.removeEventListener("pointerleave", onLeave);
          };
        },
      );
    }, sectionRef);

    return () => {
      observer?.kill();
      media.revert();
      context.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-live-card]",
        { scale: 0.93, y: 12, opacity: 0.65 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" },
      );
    }, sectionRef);
    return () => context.revert();
  }, [active]);

  const feature = FEATURES[active];

  return (
    <section ref={sectionRef} id="find-work" className="relative scroll-mt-20 overflow-hidden bg-[#061431] py-20 sm:py-28">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(38,73,216,.45),transparent_33%),radial-gradient(circle_at_82%_78%,rgba(245,179,1,.2),transparent_30%),linear-gradient(135deg,#071431_0%,#0b2b66_52%,#061637_100%)]" />
      <div data-glow="blue" aria-hidden className="absolute -left-48 top-0 size-[36rem] rounded-full bg-hi-500/25 blur-[120px]" />
      <div data-glow="gold" aria-hidden className="absolute -right-40 bottom-0 size-[32rem] rounded-full bg-gold-500/20 blur-[120px]" />
      <div aria-hidden className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_82%,transparent)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <div data-fw-enter className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 font-mono text-[.68rem] font-bold uppercase tracking-[.15em] text-gold-400 backdrop-blur">
            <Sparkles size={13} /> Built for subcontractors
          </div>
          <h2 data-fw-title data-cascade className="font-display mt-6 text-4xl font-bold leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-[4.1rem]">
            The right job
            <span className="block text-gold-400">finds your crew.</span>
          </h2>
          <p data-fw-enter className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            One live opportunity radar for work that matches your trade, paperwork and travel radius.
          </p>

          <div data-fw-enter role="tablist" aria-label="Marketplace advantages" className="mt-8 space-y-2">
            {FEATURES.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={active === index}
                onClick={() => setActive(index)}
                onPointerEnter={() => setActive(index)}
                className={clsx(
                  "flex min-h-14 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  active === index
                    ? "border-gold-400/55 bg-white/[.1] text-white"
                    : "border-white/10 bg-white/[.035] text-white/65 hover:border-white/25 hover:bg-white/[.07]",
                )}
              >
                <span className={clsx("grid size-10 shrink-0 place-items-center rounded-lg", active === index ? "bg-gold-400 text-navy-950" : "bg-white/10")}>
                  <item.Icon size={18} />
                </span>
                <span>
                  <span className="block font-display font-semibold">{item.title}</span>
                  <span className="block text-xs text-white/55">{item.label}</span>
                </span>
                <ArrowRight className={clsx("ml-auto transition-transform", active === index && "translate-x-1 text-gold-400")} size={17} />
              </button>
            ))}
          </div>

          <div data-fw-enter className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="inline-flex min-h-12 items-center rounded-lg bg-gold-500 px-5 text-sm font-bold text-navy-950 shadow-[0_12px_32px_rgba(245,179,1,.24)] transition-transform hover:-translate-y-0.5 hover:bg-gold-400">
              Browse matched jobs <ArrowRight size={16} className="ml-2" />
            </Link>
            <span className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/15 bg-white/[.05] px-4 font-mono text-xs text-white/65">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
              {openCount} projects live now
            </span>
          </div>
        </div>

        <div data-fw-enter className="relative mx-auto w-full max-w-[650px] [perspective:1200px]">
          <div ref={sceneRef} className="relative aspect-square [transform-style:preserve-3d]">
            <div data-scene-core className="absolute inset-[8%] [transform-style:preserve-3d]">
              <div data-orbit aria-hidden className="absolute inset-[8%] rounded-full border border-dashed border-gold-400/35 [transform:rotateX(67deg)_translateZ(-45px)]">
                <span className="absolute left-1/2 top-[-5px] size-2.5 rounded-full bg-gold-400 shadow-[0_0_18px_#ffc63a]" />
              </div>
              <div className="absolute inset-x-[7%] bottom-[12%] h-[58%] rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/15 to-white/[.025] shadow-[0_45px_90px_rgba(0,0,0,.4)] backdrop-blur-xl [transform:rotateX(62deg)_rotateZ(-8deg)]" />

              <div className="absolute inset-x-[16%] bottom-[24%] h-[42%]">
                <Tower className="left-[5%] h-[62%] w-[22%] bg-[#1c418f]" />
                <Tower className="left-[31%] h-[90%] w-[25%] bg-[#2d5bd2]" />
                <Tower className="left-[60%] h-[72%] w-[21%] bg-[#153674]" />
                <div data-tower className="absolute bottom-0 right-0 h-[46%] w-[16%] rounded-t-lg border border-gold-300/40 bg-gold-500 shadow-xl">
                  <HardHat className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-navy-950" size={24} />
                </div>
              </div>

              <div data-float data-live-card className="absolute right-[-2%] top-[7%] w-[49%] rounded-2xl border border-white/20 bg-[#0c2452]/90 p-4 shadow-[0_24px_55px_rgba(0,0,0,.4)] backdrop-blur-xl [transform:translateZ(110px)]">
                <span className="rounded-md bg-gold-400 px-2 py-1 font-mono text-[.58rem] font-bold uppercase text-navy-950">Live match</span>
                <div className="mt-3 font-display text-sm font-semibold text-white">{feature.title}</div>
                <p className="mt-1.5 text-[.68rem] leading-relaxed text-white/60">{feature.body}</p>
              </div>
              <div data-float className="absolute -left-[2%] top-[31%] rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 shadow-xl backdrop-blur-xl [transform:translateZ(130px)]">
                <span className="flex items-center gap-2 text-xs font-semibold text-white"><MapPin size={14} className="text-gold-400" /> Within 35 miles</span>
              </div>
              <div data-float className="absolute bottom-[8%] right-[8%] rounded-xl border border-emerald-300/25 bg-[#082c2b]/90 px-3 py-2.5 shadow-xl backdrop-blur-xl [transform:translateZ(140px)]">
                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-200"><BadgeCheck size={15} /> Paperwork verified</span>
              </div>
            </div>
          </div>
          <p className="text-center font-mono text-[.64rem] uppercase tracking-[.15em] text-white/40">
            Move your pointer · scroll to rotate
          </p>
        </div>
      </div>
    </section>
  );
}

function Tower({ className }: { className: string }) {
  return (
    <div data-tower className={clsx("absolute bottom-0 overflow-hidden rounded-t-xl border border-white/15 shadow-xl", className)}>
      <Building2 className="absolute left-1/2 top-4 -translate-x-1/2 text-white/25" size={27} />
      <div className="absolute inset-x-2 bottom-3 grid grid-cols-2 gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="h-2 rounded-[2px] bg-sky-200/40" />
        ))}
      </div>
    </div>
  );
}
