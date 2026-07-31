"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

/**
 * One motion system for the whole marketing site.
 *
 * Sections opt in with data attributes instead of importing GSAP themselves:
 *
 *   data-split            hero-grade headline — words rise out of masked lines
 *   data-reveal           fade + rise when scrolled into view
 *   data-reveal-child     stagger the element's children instead
 *   data-parallax="0.2"   scroll parallax, value = strength
 *   data-counter="5000"   count up when visible (data-prefix / data-suffix)
 *
 * CSS sets every start pose, so if this file never runs (JS off, bot, reduced
 * motion) the page is simply... there. Motion is a garnish, not a dependency.
 */
export function MotionProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // CSS has already un-hidden everything; do nothing at all.
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);
    const pendingTitles = new Set<HTMLElement>();
    const revealVisibleTitles = () => {
      const triggerLine = window.innerHeight * 0.9;
      pendingTitles.forEach((el) => {
        const bounds = el.getBoundingClientRect();
        if (bounds.top > triggerLine || bounds.bottom < 0) return;
        pendingTitles.delete(el);
        gsap.to(el, {
          x: 0,
          opacity: 1,
          clipPath: "inset(0 0% 0 0)",
          duration: 1.05,
          ease: "power4.out",
          clearProps: "transform,clipPath",
        });
      });
    };
    gsap.ticker.add(revealVisibleTitles);

    // Lenis drives scroll on fine-pointer devices; phones keep their native
    // momentum, which is already better than anything we could fake.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let lenis: Lenis | null = null;
    const raf = (time: number) => lenis?.raf(time * 1000);

    if (!isTouch) {
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    // Web fonts shift layout as they land — so char-splitting waits for them
    // (otherwise the split measures the fallback font), and every trigger
    // position is refreshed once they are in.
    document.fonts?.ready.then(() => {
      ctx.add(() => {
        const cascade = (el: HTMLElement) => {
          if (el.dataset.cascadeDone) return;
          el.dataset.cascadeDone = "1";
          gsap.set(el, {
            x: -96,
            opacity: 0,
            clipPath: "inset(0 100% 0 0)",
          });
          pendingTitles.add(el);
        };

        // -- site titles: left-to-right reveal when each title enters view --
        gsap.utils.toArray<HTMLElement>("[data-cascade]").forEach(cascade);

        // -- auto coverage: any heading or paragraph nobody choreographed --
        // Elements already inside a staggered/reveal parent are left alone,
        // otherwise they would animate twice and fight each other.
        const covered = (el: HTMLElement) =>
          el.closest(
            "[data-reveal],[data-reveal-child],[data-reveal-row],[data-split],[data-cascade],.animate-step-in",
          ) !== null;

        gsap.utils
          .toArray<HTMLElement>("main h2:not([data-cascade]), main h3")
          .forEach((el) => {
            if (covered(el)) return;
            cascade(el);
          });

        gsap.utils.toArray<HTMLElement>("main p").forEach((el) => {
          if (covered(el)) return;
          gsap.from(el, {
            y: 26,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 89%", once: true },
          });
        });
      });
      ScrollTrigger.refresh();
    });

    const ctx = gsap.context(() => {
      // -- split headline: wrap words once, then stagger them up -------------
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        if (el.dataset.splitDone) return;
        el.dataset.splitDone = "1";

        const words = (el.textContent ?? "").trim().split(/\s+/);
        el.setAttribute("aria-label", words.join(" "));
        el.innerHTML = words
          .map(
            (w) =>
              `<span class="split-line" aria-hidden="true"><span class="split-word">${w}</span></span>`,
          )
          .join(" ");

        gsap.to(el.querySelectorAll(".split-word"), {
          y: 0,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.055,
          delay: 0.12 + Number(el.dataset.splitDelay ?? 0),
        });
      });

      // -- scroll reveals ----------------------------------------------------
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: Number(el.dataset.revealDelay ?? 0),
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-child]").forEach((el) => {
        gsap.to(el.children, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 84%", once: true },
        });
      });

      // children sweep in left-to-right, one after the other
      gsap.utils.toArray<HTMLElement>("[data-reveal-row]").forEach((el) => {
        gsap.to(el.children, {
          opacity: 1,
          x: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.14,
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });

      // -- counters ----------------------------------------------------------
      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.counter ?? 0);
        const prefix = el.dataset.prefix ?? "";
        const suffix = el.dataset.suffix ?? "";
        const state = { n: 0 };

        gsap.to(state, {
          n: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(state.n).toLocaleString("en-US")}${suffix}`;
          },
        });
      });

      // -- parallax (desktop only — phones get a calmer page) ----------------
      ScrollTrigger.matchMedia({
        "(min-width: 769px)": () => {
          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
            const strength = Number(el.dataset.parallax ?? 0.2);
            gsap.to(el, {
              yPercent: -100 * strength,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          });
        },
      });
    });

    // Async/pinned sections can add substantial scroll height after the first
    // trigger pass. Keep downstream trigger positions in sync without coupling
    // those sections to the global motion system.
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let lastDocumentHeight = document.documentElement.scrollHeight;
    const refreshForLayoutChange = () => {
      const nextHeight = document.documentElement.scrollHeight;
      if (Math.abs(nextHeight - lastDocumentHeight) < 2) return;
      lastDocumentHeight = nextHeight;
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    const layoutObserver = new ResizeObserver(refreshForLayoutChange);
    layoutObserver.observe(document.body);
    const refreshOnLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshOnLoad, { once: true });

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      pendingTitles.clear();
      layoutObserver.disconnect();
      window.removeEventListener("load", refreshOnLoad);
      ctx.revert();
      gsap.ticker.remove(revealVisibleTitles);
      gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
