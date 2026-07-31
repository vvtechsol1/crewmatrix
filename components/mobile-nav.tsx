"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#find-work", label: "Find work" },
  { href: "/#find-contractors", label: "Find contractors" },
  { href: "/#pricing", label: "Pricing" },
];

export function MobileNav({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;

    const focusable = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        className={
          light
            ? "grid size-11 shrink-0 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            : "grid size-11 shrink-0 place-items-center rounded-md text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100 lg:hidden"
        }
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div aria-hidden="true" onClick={() => close(true)} className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
          <div
            ref={drawerRef}
            id="site-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="absolute inset-y-0 right-0 flex w-[19rem] max-w-[85vw] flex-col border-l border-ink-800 bg-ink-900"
          >
            <div className="flex items-center justify-between border-b border-ink-800 px-5 py-3">
              <span className="font-semibold tracking-tight">Menu</span>
              <button onClick={() => close(true)} aria-label="Close menu" className="grid size-11 place-items-center rounded-md text-ink-400 hover:bg-ink-800 hover:text-ink-100">
                <X size={19} />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="flex-1 space-y-1 p-3">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => close()} className="block min-h-11 rounded-md px-3 py-3 text-[0.95rem] text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-100">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-2 border-t border-ink-800 p-4">
              <Link href="/signup" onClick={() => close()} className="block min-h-11 rounded-md bg-gold-500 px-4 py-3 text-center text-sm font-semibold text-ink-100 transition-colors hover:bg-gold-400">
                Sign up free
              </Link>
              <Link href="/login" onClick={() => close()} className="block min-h-11 rounded-md border border-hi-500 px-4 py-3 text-center text-sm font-semibold text-hi-500 transition-colors hover:bg-hi-500 hover:text-white">
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
