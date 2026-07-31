"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  StackedCardAutoplay,
  type StackedCardItem,
} from "@/components/landing/stacked-card-autoplay";
import {
  ArrowRight,
  BadgeCheck,
  Fan,
  Hammer,
  HardHat,
  Home,
  Layers,
  LayoutGrid,
  MapPin,
  Paintbrush,
  Ruler,
  Sparkles,
  Trees,
  Truck,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";

const TRADES = [
  { name: "Electrical", Icon: Zap, count: 148, crew: "Vega Electric", rating: "4.9" },
  { name: "Plumbing", Icon: Wrench, count: 96, crew: "Northline Plumbing", rating: "4.8" },
  { name: "HVAC", Icon: Fan, count: 82, crew: "Northpeak Mechanical", rating: "4.9" },
  { name: "Roofing", Icon: Home, count: 74, crew: "Summit Roofing", rating: "4.8" },
  { name: "Concrete", Icon: Layers, count: 121, crew: "Caldera Concrete", rating: "4.9" },
  { name: "Framing", Icon: Hammer, count: 105, crew: "Atlas Framing", rating: "4.7" },
  { name: "Drywall", Icon: LayoutGrid, count: 88, crew: "Ridgeline Drywall", rating: "4.8" },
  { name: "Painting", Icon: Paintbrush, count: 67, crew: "TrueCoat Services", rating: "4.7" },
  { name: "Flooring", Icon: Ruler, count: 59, crew: "Front Range Floors", rating: "4.8" },
  { name: "Excavation", Icon: Truck, count: 43, crew: "Iron Ridge Earthworks", rating: "4.9" },
  { name: "Landscaping", Icon: Trees, count: 76, crew: "Highland Landscape", rating: "4.7" },
  { name: "Masonry", Icon: Warehouse, count: 52, crew: "Fieldstone Masonry", rating: "4.9" },
];

const CREW_CARDS: StackedCardItem[] = [
  {
    id: "general",
    image: "/images/qualified-subcontractor-crew-v2.png",
    alt: "Construction professionals reviewing project plans on a commercial site",
    eyebrow: "Featured in general construction",
    title: "Northline Builders",
    rating: "4.9",
    meta: "126 crews found",
  },
  {
    id: "electrical",
    image: "/images/qualified-electrician-crew-v3.png",
    alt: "Qualified electricians inspecting conduit and electrical plans",
    eyebrow: "Featured in electrical",
    title: "Vega Electric",
    rating: "4.9",
    meta: "148 crews found",
  },
  {
    id: "structural",
    image: "/images/qualified-structural-crew-v3.png",
    alt: "Structural construction crew coordinating concrete and framing work",
    eyebrow: "Featured in concrete & framing",
    title: "Caldera Structural",
    rating: "4.8",
    meta: "121 crews found",
  },
  {
    id: "mechanical",
    image: "/images/qualified-subcontractor-crew-v2.png",
    alt: "Mechanical subcontractors coordinating work on a commercial site",
    eyebrow: "Featured in mechanical",
    title: "Northpeak Mechanical",
    rating: "4.9",
    meta: "82 crews found",
    objectPosition: "62% center",
  },
  {
    id: "sitework",
    image: "/images/qualified-structural-crew-v3.png",
    alt: "Sitework professionals reviewing the next phase of construction",
    eyebrow: "Featured in sitework",
    title: "Iron Ridge Earthworks",
    rating: "4.8",
    meta: "43 crews found",
    objectPosition: "38% center",
  },
];

export function FindProsExperience() {
  const root = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    const context = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-pro-title]", start: "top 85%", once: true } })
        .from("[data-pro-copy]", {
          x: -38,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
        })
        .from(
          visual.current,
          { x: 48, rotationY: -8, opacity: 0, duration: 1, ease: "power3.out" },
          "-=.8",
        );

      gsap.to("[data-pro-orb='blue']", {
        xPercent: 25,
        yPercent: -14,
        scale: 1.18,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-pro-orb='gold']", {
        xPercent: -20,
        yPercent: 16,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-proof]", {
        y: (index) => (index % 2 ? 9 : -9),
        duration: (index) => 3 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      media.add("(min-width: 900px) and (pointer: fine)", () => {
        if (!visual.current) return;
        const imageX = gsap.quickTo("[data-stack-image]", "xPercent", { duration: 0.7, ease: "power3.out" });
        const imageY = gsap.quickTo("[data-stack-image]", "yPercent", { duration: 0.7, ease: "power3.out" });
        const tiltX = gsap.quickTo(visual.current, "rotationX", { duration: 0.75, ease: "power3.out" });
        const tiltY = gsap.quickTo(visual.current, "rotationY", { duration: 0.75, ease: "power3.out" });

        const move = (event: PointerEvent) => {
          const bounds = visual.current!.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          imageX(x * -3);
          imageY(y * -3);
          tiltY(x * 7);
          tiltX(y * -5);
          visual.current!.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
          visual.current!.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
        };
        const leave = () => {
          imageX(0);
          imageY(0);
          tiltX(0);
          tiltY(0);
        };
        visual.current.addEventListener("pointermove", move);
        visual.current.addEventListener("pointerleave", leave);
        return () => {
          visual.current?.removeEventListener("pointermove", move);
          visual.current?.removeEventListener("pointerleave", leave);
        };
      });
    }, root);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section ref={root} id="find-contractors" className="relative scroll-mt-20 overflow-hidden border-y border-ink-800 bg-[#f7f9fd] py-20 sm:py-28">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(38,73,216,.11),transparent_30%),radial-gradient(circle_at_88%_75%,rgba(245,179,1,.14),transparent_27%)]" />
      <div data-pro-orb="blue" aria-hidden className="absolute -left-40 top-16 size-96 rounded-full bg-hi-500/10 blur-[100px]" />
      <div data-pro-orb="gold" aria-hidden className="absolute -right-36 bottom-0 size-96 rounded-full bg-gold-500/12 blur-[110px]" />
      <div aria-hidden className="absolute inset-0 opacity-[.38] [background-image:linear-gradient(rgba(38,73,216,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(38,73,216,.06)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[.95fr_1.05fr]">
        <div>
          <div data-pro-copy className="inline-flex items-center gap-2 rounded-full border border-gold-600/20 bg-gold-500/10 px-3 py-1.5 font-mono text-[.68rem] font-bold uppercase tracking-[.15em] text-gold-600">
            <Sparkles size={13} /> Built for general contractors
          </div>
          <h2 data-pro-title data-cascade className="font-display mt-5 text-4xl font-bold leading-[1] tracking-[-.045em] text-hi-500 sm:text-[2.9rem] lg:text-[3.15rem] xl:text-[3.35rem]">
            <span className="block sm:whitespace-nowrap">Find crews you can</span>
            <span className="block text-gold-600 sm:whitespace-nowrap">put on the schedule.</span>
          </h2>
          <p data-pro-copy className="mt-3 max-w-xl text-sm leading-relaxed text-ink-400 sm:text-base">
            Search by trade, service radius and verified compliance—then start the conversation with the job details already attached.
          </p>

          <div role="listbox" aria-label="Choose a trade" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TRADES.map((item, index) => (
              <button
                key={item.name}
                type="button"
                role="option"
                aria-selected={active === index}
                onClick={() => setActive(index)}
                className={clsx(
                  "group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition-all duration-300",
                  active === index
                    ? "-translate-y-1 border-hi-500 bg-hi-500 text-white shadow-[0_14px_28px_rgba(38,73,216,.24)]"
                    : "border-ink-800 bg-white/90 text-ink-100 shadow-[0_5px_16px_rgba(14,27,51,.06)] hover:-translate-y-1 hover:border-hi-500/40 hover:bg-white hover:shadow-[0_12px_26px_rgba(38,73,216,.12)]",
                )}
              >
                <span className={clsx("grid size-11 shrink-0 place-items-center rounded-xl transition-all duration-300", active === index ? "bg-white/15 text-white" : "bg-hi-500/10 text-hi-500 group-hover:scale-110 group-hover:bg-hi-500/15")}>
                  <item.Icon size={23} strokeWidth={1.9} />
                </span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 text-left">
            <Link
              href="/signup"
              style={{ color: "#ffffff", width: "max-content" }}
              className="inline-flex min-h-12 items-center justify-start rounded-lg bg-hi-500 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(38,73,216,.2)] transition-transform hover:-translate-y-0.5 hover:bg-hi-400"
            >
              Find qualified crews <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>

        <div className="[perspective:1200px]">
          <div
            ref={visual}
            style={{ "--spot-x": "50%", "--spot-y": "50%" } as React.CSSProperties}
            className="relative mx-auto aspect-[4/4.35] max-w-[590px] [transform-style:preserve-3d]"
          >
            <div className="absolute inset-[4%] rotate-3 rounded-[2rem] bg-hi-500/15" />
            <div className="absolute inset-[4%] -rotate-2 rounded-[2rem] border border-gold-500/30 bg-gold-500/10" />
            <div className="absolute inset-[6%]">
              <StackedCardAutoplay cards={CREW_CARDS} interval={2} duration={0.8} />
            </div>

            <div data-proof className="absolute right-[-2%] top-[5%] rounded-xl border border-ink-800 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur [transform:translateZ(70px)]">
              <span className="flex items-center gap-2 text-xs font-semibold text-ink-100"><BadgeCheck size={15} className="text-ok-500" /> Licence & insurance current</span>
            </div>
            <div data-proof className="absolute -left-[2%] top-[34%] rounded-xl border border-ink-800 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur [transform:translateZ(95px)]">
              <span className="flex items-center gap-2 text-xs font-semibold text-ink-100"><MapPin size={14} className="text-hi-500" /> Inside your service radius</span>
            </div>
            <div data-proof className="absolute bottom-[3%] right-[5%] rounded-xl border border-gold-500/25 bg-navy-950 px-3.5 py-2.5 shadow-xl [transform:translateZ(110px)]">
              <span className="flex items-center gap-2 text-xs font-semibold text-white"><HardHat size={15} className="text-gold-400" /> Ready for your schedule</span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-1.5 w-6 rounded-full bg-hi-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink-700" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink-700" />
            </div>
            <p className="font-mono text-[.62rem] uppercase tracking-[.15em] text-ink-600">
              Live crew showcase
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
