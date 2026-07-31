"use client";

import { useRef } from "react";
import clsx from "clsx";

/**
 * Pointer-driven 3D tilt. Fine pointers only — a thumb cannot hover, so on
 * touch this renders as a perfectly ordinary card with zero listeners firing.
 */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const el = ref.current;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
    });
  }

  function onLeave() {
    if (!ref.current) return;
    cancelAnimationFrame(frame.current);
    ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={clsx("transition-transform duration-300 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}
