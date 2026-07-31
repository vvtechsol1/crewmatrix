"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export interface StackedCardItem {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  rating: string;
  meta: string;
  objectPosition?: string;
}

interface StackedCardAutoplayProps {
  cards: StackedCardItem[];
  interval?: number;
  duration?: number;
  className?: string;
}

const positionFor = (index: number, total: number) => ({
  y: index * 13,
  scale: 1 - index * 0.025,
  rotation: index === 0 ? 0 : index % 2 ? -0.8 : 0.8,
  opacity: Math.max(0.42, 1 - index * 0.14),
  zIndex: total - index,
  boxShadow:
    index === 0
      ? "0 34px 70px -30px rgba(14,42,92,.58)"
      : "0 16px 36px -24px rgba(14,42,92,.32)",
});

export function StackedCardAutoplay({
  cards,
  interval = 2,
  duration = 0.8,
  className = "",
}: StackedCardAutoplayProps) {
  const stackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack || cards.length < 2) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const layout = () => {
        const elements = Array.from(stack.children) as HTMLElement[];
        elements.forEach((card, index) => {
          gsap.set(card, {
            ...positionFor(index, elements.length),
            x: 0,
            transformOrigin: "50% 100%",
          });
        });
      };

      layout();
      if (reducedMotion) return;

      let nextRun: gsap.core.Tween | undefined;
      const cycle = () => {
        const elements = Array.from(stack.children) as HTMLElement[];
        const topCard = elements[0];
        const timeline = gsap.timeline({
          defaults: { duration, ease: "power3.inOut" },
          onComplete: () => {
            stack.appendChild(topCard);
            layout();
            nextRun = gsap.delayedCall(interval, cycle);
          },
        });

        timeline.to(
          topCard,
          {
            x: 38,
            y: -30,
            scale: 0.96,
            rotation: 3.2,
            opacity: 0,
            zIndex: elements.length + 1,
          },
          0,
        );

        elements.slice(1).forEach((card, index) => {
          timeline.to(card, positionFor(index, elements.length), 0);
        });
      };

      nextRun = gsap.delayedCall(interval, cycle);
      return () => nextRun?.kill();
    }, stackRef);

    return () => context.revert();
  }, [cards, duration, interval]);

  return (
    <div ref={stackRef} className={`relative h-full w-full [transform-style:preserve-3d] ${className}`}>
      {cards.slice(0, 6).map((card) => (
        <article
          key={card.id}
          data-stack-card
          className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-white/75 bg-navy-950 will-change-transform"
        >
          <Image
            data-stack-image
            src={card.image}
            alt={card.alt}
            fill
            sizes="(min-width: 1024px) 550px, 90vw"
            className="scale-[1.04] object-cover"
            style={{ objectPosition: card.objectPosition ?? "center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-navy-950/10" />
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,.18), transparent 28%)",
            }}
          />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-navy-950/72 p-4 backdrop-blur-xl">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="font-mono text-[.6rem] font-bold uppercase tracking-[.14em] text-gold-400">
                  {card.eyebrow}
                </div>
                <div className="font-display mt-1 text-lg font-semibold text-white">{card.title}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">★ {card.rating}</div>
                <div className="text-[.65rem] text-white/55">{card.meta}</div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
