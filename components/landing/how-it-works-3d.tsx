"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Step {
  n: string;
  title: string;
  body: string;
}

const PHASE_LABELS = ["Foundation", "Steel frame", "Floors & glass", "Topping out"];

/**
 * "How it works" as a pinned 3D stage.
 *
 * The section pins to the viewport and the scroll wheel becomes a site
 * foreman: each quarter of scroll raises one construction phase — foundation,
 * steel frame, floors, gold topping-out — while the matching step card swaps
 * in beside it and a gold arrowhead walks the progress rail underneath.
 *
 * three.js is imported only when the section approaches; reduced motion gets
 * the finished building and all four steps, static.
 */
export function HowItWorks3D({ steps }: { steps: Step[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [still, setStill] = useState(false); // reduced-motion layout

  useEffect(() => {
    const section = sectionRef.current;
    const mount = mountRef.current;
    if (!section || !mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        void init();
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(section);

    async function init() {
      const THREE = await import("three");
      if (disposed || !mount || !section) return;

      gsap.registerPlugin(ScrollTrigger);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      type M3 = any;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      if (reduced) setStill(true);

      /* -------------------------- renderer / scene -------------------------- */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.75 : 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xeef3fc, 15, 32);

      const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 60);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xc3d0e8, 1.2));
      const sun = new THREE.DirectionalLight(0xfff3d6, 1.7);
      sun.position.set(6, 9, 5);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x2649d8, 0.5);
      rim.position.set(-6, 4, -6);
      scene.add(rim);

      const M = {
        steel: new THREE.MeshStandardMaterial({ color: 0x2649d8, roughness: 0.4, metalness: 0.4 }),
        navy: new THREE.MeshStandardMaterial({ color: 0x0e2a5c, roughness: 0.6, metalness: 0.2 }),
        slab: new THREE.MeshStandardMaterial({ color: 0xeaeef7, roughness: 0.9 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0xd5dcea, roughness: 0.95 }),
        gold: new THREE.MeshStandardMaterial({ color: 0xf5b301, roughness: 0.28, metalness: 0.6 }),
        glass: new THREE.MeshStandardMaterial({
          color: 0x9db8f5,
          roughness: 0.12,
          metalness: 0.1,
          transparent: true,
          opacity: 0.38,
        }),
      };

      /* ------------------------------ ground ------------------------------- */
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(16, 48),
        new THREE.MeshStandardMaterial({ color: 0xf0f3fa, roughness: 1 }),
      );
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);

      const grid = new THREE.GridHelper(30, 30, 0x2649d8, 0x2649d8);
      (grid.material as M3).transparent = true;
      (grid.material as M3).opacity = 0.12;
      grid.position.y = 0.01;
      scene.add(grid);

      // soft contact shadow that deepens as the building gains mass
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(2.8, 32),
        new THREE.MeshBasicMaterial({ color: 0x0e2a5c, transparent: true, opacity: 0 }),
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.012;
      scene.add(shadow);

      /* --------------------------- the building ---------------------------- */
      type Kind = "grow" | "rise" | "pop";
      interface Animated {
        mesh: M3;
        kind: Kind;
        ph0: number;
        ph1: number;
        baseY: number;
        h: number;
      }
      const animated: Animated[] = [];
      const building = new THREE.Group();
      scene.add(building);

      // The whole building stands as a blueprint ghost from the first frame —
      // scroll turns the plan into the real thing, phase by phase.
      const ghostMat = new THREE.LineBasicMaterial({ color: 0x2649d8, transparent: true, opacity: 0.16 });

      function add(geo: M3, mat: M3, x: number, y: number, z: number, kind: Kind, ph0: number, ph1: number, h = 1) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        building.add(mesh);
        animated.push({ mesh, kind, ph0, ph1, baseY: y, h });
        if (geo.type === "BoxGeometry") {
          const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(geo), ghostMat);
          ghost.position.set(x, y, z);
          building.add(ghost);
        }
        return mesh;
      }

      const LVLS = 3;
      const H = 1.05;
      const S = 1.25;

      // — phase 1 (0–0.25): site setup ————————————————————————————————
      add(new THREE.BoxGeometry(4.5, 0.22, 4.5), M.concrete, 0, 0.11, 0, "rise", 0.02, 0.11);
      [-1, 1].forEach((ix) =>
        [-1, 1].forEach((iz, k) =>
          add(new THREE.BoxGeometry(0.6, 0.3, 0.6), M.navy, ix * 1.6, 0.15, iz * 1.6, "pop", 0.08 + k * 0.02, 0.2),
        ),
      );

      const crane = new THREE.Group();
      crane.position.set(-3.1, 0, -2.4);
      building.add(crane);
      const craneParts: Animated[] = [];
      function addCrane(geo: M3, mat: M3, x: number, y: number, z: number, kind: Kind, ph0: number, ph1: number, h = 1) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        crane.add(mesh);
        craneParts.push({ mesh, kind, ph0, ph1, baseY: y, h });
        if (geo.type === "BoxGeometry") {
          const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(geo), ghostMat);
          ghost.position.set(x, y, z);
          crane.add(ghost);
        }
      }
      addCrane(new THREE.BoxGeometry(0.7, 0.18, 0.7), M.concrete, 0, 0.09, 0, "pop", 0.1, 0.16);
      addCrane(new THREE.BoxGeometry(0.16, 4.6, 0.16), M.gold, 0, 2.4, 0, "grow", 0.12, 0.23, 4.6);
      const jib = new THREE.Group();
      jib.position.y = 4.55;
      crane.add(jib);
      const jibArm = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 0.12), M.gold);
      jibArm.position.x = 1.3;
      jib.add(jibArm);
      const counterJib = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.12), M.navy);
      counterJib.position.x = -0.85;
      jib.add(counterJib);
      const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 6), M.navy);
      hook.position.set(2.6, -0.8, 0);
      jib.add(hook);
      jib.scale.setScalar(0.001);

      // — phase 2 (0.25–0.5): steel frame ————————————————————————————
      const colGeo = new THREE.BoxGeometry(0.11, H, 0.11);
      for (let lvl = 0; lvl < LVLS; lvl++) {
        for (let ix = -1; ix <= 1; ix++) {
          for (let iz = -1; iz <= 1; iz++) {
            const i = (ix + 1) * 3 + (iz + 1);
            const p0 = 0.26 + lvl * 0.06 + i * 0.004;
            add(colGeo, M.steel, ix * S, 0.22 + lvl * H + H / 2, iz * S, "grow", p0, p0 + 0.06, H);
          }
        }
        const y = 0.22 + (lvl + 1) * H;
        const bx = new THREE.BoxGeometry(2 * S + 0.2, 0.09, 0.09);
        const bz = new THREE.BoxGeometry(0.09, 0.09, 2 * S + 0.2);
        [-1, 1].forEach((s, k) => {
          add(bx, M.steel, 0, y, s * S, "pop", 0.31 + lvl * 0.055 + k * 0.008, 0.38 + lvl * 0.055);
          add(bz, M.steel, s * S, y, 0, "pop", 0.32 + lvl * 0.055 + k * 0.008, 0.39 + lvl * 0.055);
        });
      }

      // — phase 3 (0.5–0.75): floors and glass ———————————————————————
      for (let lvl = 0; lvl < LVLS; lvl++) {
        const y = 0.22 + (lvl + 1) * H + 0.05;
        add(new THREE.BoxGeometry(3.1, 0.1, 3.1), M.slab, 0, y, 0, "rise", 0.51 + lvl * 0.055, 0.59 + lvl * 0.055);
        const gp0 = 0.545 + lvl * 0.055;
        add(new THREE.BoxGeometry(2 * S - 0.1, H - 0.18, 0.04), M.glass, 0, 0.22 + lvl * H + H / 2, S - 0.02, "rise", gp0, gp0 + 0.08, H);
        add(new THREE.BoxGeometry(0.04, H - 0.18, 2 * S - 0.1), M.glass, S - 0.02, 0.22 + lvl * H + H / 2, 0, "rise", gp0 + 0.015, gp0 + 0.095, H);
      }

      // — phase 4 (0.75–1): roof and the gold beam ———————————————————
      const roofY = 0.22 + LVLS * H + 0.14;
      add(new THREE.BoxGeometry(3.3, 0.12, 3.3), M.slab, 0, roofY, 0, "rise", 0.76, 0.84);
      add(new THREE.BoxGeometry(3.3, 0.14, 0.08), M.navy, 0, roofY + 0.12, 1.61, "pop", 0.8, 0.87);
      add(new THREE.BoxGeometry(3.3, 0.14, 0.08), M.navy, 0, roofY + 0.12, -1.61, "pop", 0.81, 0.88);
      add(new THREE.BoxGeometry(0.08, 0.14, 3.3), M.navy, 1.61, roofY + 0.12, 0, "pop", 0.82, 0.89);
      add(new THREE.BoxGeometry(0.08, 0.14, 3.3), M.navy, -1.61, roofY + 0.12, 0, "pop", 0.83, 0.9);
      add(new THREE.BoxGeometry(2.4, 0.14, 0.2), M.gold, 0, roofY + 0.28, 0, "pop", 0.88, 0.95);
      const beacon = add(new THREE.SphereGeometry(0.09, 16, 16), M.gold, 0, roofY + 0.5, 0, "pop", 0.93, 0.985);

      const all = [...animated, ...craneParts];

      /* ------------------------ progress → geometry ------------------------ */
      const easeBack = (k: number) => {
        const c = 1.70158;
        const t = k - 1;
        return 1 + (c + 1) * t * t * t + c * t * t;
      };

      const pointer = { x: 0, y: 0 };

      function apply(p: number) {
        for (const a of all) {
          const k = Math.min(1, Math.max(0, (p - a.ph0) / (a.ph1 - a.ph0)));
          const m = a.mesh;
          if (a.kind === "grow") {
            m.scale.y = Math.max(0.001, k);
            m.position.y = a.baseY - (a.h * (1 - k)) / 2;
            m.visible = k > 0.001;
          } else if (a.kind === "rise") {
            m.position.y = a.baseY - (1 - k) * 0.9;
            const mat = m.material as M3;
            if (!mat.transparent && k < 1) mat.transparent = true;
            mat.opacity = mat === M.glass ? 0.38 * k : k;
            m.visible = k > 0.001;
          } else {
            const s = k >= 1 ? 1 : Math.max(0.001, easeBack(k));
            m.scale.setScalar(s);
            m.visible = k > 0.001;
          }
        }

        const jk = Math.min(1, Math.max(0, (p - 0.19) / 0.06));
        jib.scale.setScalar(Math.max(0.001, jk >= 1 ? 1 : easeBack(jk)));

        (shadow.material as M3).opacity = 0.03 + p * 0.06;
        shadow.scale.setScalar(0.6 + p * 0.5);

        const ang = -0.62 + p * 1.15 + pointer.x * 0.12;
        const radius = 11.8 - p * 2.8;
        camera.position.set(Math.sin(ang) * radius, 2.3 + p * 3.4 + pointer.y * 0.6, Math.cos(ang) * radius);
        camera.lookAt(0, 0.9 + p * 1.0, 0);
      }

      /* ----------------------- drive: pin + scrub + idle ------------------- */
      let progress = reduced ? 1 : 0;
      let inView = true;
      let rafId = 0;
      const clock = new THREE.Clock();

      function frame() {
        const t = clock.getElapsedTime();
        if (!reduced) {
          jib.rotation.y = Math.sin(t * 0.22) * 0.55 + 0.4;
          const pulse = 1 + Math.sin(t * 2.2) * 0.12;
          if (beacon.visible) beacon.scale.setScalar(beacon.scale.x * 0.9 + pulse * 0.1);
        }
        apply(progress);
        renderer.render(scene, camera);
        if (inView) rafId = requestAnimationFrame(frame);
      }

      const visIO = new IntersectionObserver(([e]) => {
        const was = inView;
        inView = e.isIntersecting;
        if (inView && !was) rafId = requestAnimationFrame(frame);
      });
      visIO.observe(mount);

      let st: InstanceType<typeof ScrollTrigger> | undefined;
      if (!reduced) {
        // Pin the stage: the section holds the screen while scroll builds the
        // site, one quarter per step, and settles on step boundaries.
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=320%",
          pin: true,
          refreshPriority: 1,
          anticipatePin: 1,
          scrub: 0.5,
          snap: {
            snapTo: 1 / steps.length,
            duration: { min: 0.2, max: 0.5 },
            ease: "power2.out",
          },
          onUpdate: (self) => {
            progress = self.progress;
            const pct = (progress * 100).toFixed(2);
            if (railRef.current) railRef.current.style.width = `${pct}%`;
            if (arrowRef.current) arrowRef.current.style.left = `${pct}%`;
            const idx = Math.max(0, Math.min(steps.length - 1, Math.ceil(progress * steps.length) - 1));
            setActive((prev) => (prev === idx ? prev : idx));
          },
        });

        // This pinned scene is initialized after Three.js loads. Re-sort and
        // refresh on the next frame so every trigger below it includes the
        // newly-created pin spacer in its start position.
        requestAnimationFrame(() => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
      } else {
        setActive(steps.length - 1);
        if (railRef.current) railRef.current.style.width = "100%";
        if (arrowRef.current) arrowRef.current.style.display = "none";
      }

      function onPointer(e: PointerEvent) {
        if (e.pointerType !== "mouse") return;
        const r = section!.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointer.y = ((e.clientY - r.top) / r.height - 0.5) * -1;
      }
      if (!coarse && !reduced) section.addEventListener("pointermove", onPointer);

      const ro = new ResizeObserver(() => {
        if (!mount) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      });
      ro.observe(mount);

      apply(progress);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        visIO.disconnect();
        ro.disconnect();
        st?.kill();
        section.removeEventListener("pointermove", onPointer);
        scene.traverse((o) => {
          const mesh = o as M3;
          if (mesh.geometry) mesh.geometry.dispose();
        });
        Object.values(M).forEach((m) => m.dispose());
        ghostMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    return () => {
      disposed = true;
      io.disconnect();
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = steps[active];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="scroll-mt-20 overflow-hidden border-y border-ink-800 bg-gradient-to-b from-white via-[#f3f6fc] to-white"
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-10">
        <div className="text-center">
          <div className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-gold-600">
            How it works
          </div>
          <h2 data-cascade className="text-display-lg mx-auto mt-3 max-w-4xl text-hi-500">
            <span className="block">Watch every job come together.</span>
            <span className="mt-1 block text-gold-600">One clear step at a time.</span>
          </h2>
        </div>

        <div className="mt-6 grid flex-1 items-center gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          {/* the site */}
          <div className="relative">
            <div
              ref={mountRef}
              aria-hidden
              className={clsx(
                "h-[38vh] w-full overflow-hidden rounded-3xl border border-ink-800 bg-gradient-to-b from-[#e8effc] via-white to-[#eef2fa] shadow-[inset_0_1px_0_rgb(255_255_255),0_30px_60px_-30px_rgb(14_42_92/0.25)] sm:h-[44vh] lg:h-[58vh]",
                "transition-opacity duration-700",
                ready ? "opacity-100" : "opacity-0",
              )}
            />

            {/* phase chips — the site diary */}
            <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
              {PHASE_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={clsx(
                    "rounded-full border px-3 py-1 font-mono text-[0.65rem] font-medium transition-all duration-500",
                    i < active
                      ? "border-gold-500/50 bg-gold-500/15 text-gold-600"
                      : i === active
                        ? "border-hi-500/50 bg-white text-hi-500 shadow-sm"
                        : "border-ink-800 bg-white/60 text-ink-600 opacity-0 lg:opacity-60",
                  )}
                >
                  {i < active ? "✓ " : ""}
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* the story — one step at a time */}
          <div className="relative">
            {/* giant ghost number */}
            <div
              key={`ghost-${active}`}
              aria-hidden
              className="animate-step-in font-display pointer-events-none absolute -top-14 right-0 select-none text-[9rem] font-bold leading-none text-hi-500/[0.07] lg:text-[12rem]"
            >
              {step.n}
            </div>

            {!still ? (
              <div key={active} className="animate-step-in relative">
                <div className="flex items-center gap-3">
                  <span className="font-display grid size-14 shrink-0 place-items-center rounded-2xl bg-hi-500 text-lg font-bold text-white shadow-[0_12px_32px_-10px_rgb(38_73_216/0.6)]">
                    {step.n}
                  </span>
                  <span className="rounded-full border border-gold-500/40 bg-gold-500/10 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold-600">
                    Step {active + 1} of {steps.length}
                  </span>
                </div>
                <h3 className="text-display-lg mt-6 text-hi-500">{step.title}</h3>
                <p className="mt-5 max-w-md text-xl leading-relaxed text-ink-300">{step.body}</p>
              </div>
            ) : (
              <ol className="relative space-y-5">
                {steps.map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="font-display grid size-9 shrink-0 place-items-center rounded-xl bg-hi-500 text-sm font-bold text-white">
                      {s.n}
                    </span>
                    <div>
                      <div className="font-display font-semibold">{s.title}</div>
                      <p className="mt-1 text-sm text-ink-400">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {/* progress arrow — the road through the four steps */}
            {!still && (
              <div className="relative mt-12 pr-4">
                <div className="relative h-1.5 rounded-full bg-ink-800">
                  <div
                    ref={railRef}
                    className="h-full rounded-full bg-gradient-to-r from-hi-500 via-hi-500 to-gold-500"
                    style={{ width: "0%" }}
                  />
                  {/* travelling arrowhead */}
                  <div
                    ref={arrowRef}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: "0%" }}
                  >
                    <svg width="22" height="18" viewBox="0 0 22 18" className="drop-shadow-md">
                      <path d="M0 9 L12 9 M8 2 L15 9 L8 16" fill="none" stroke="#d99b00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="18.5" cy="9" r="3.2" fill="#f5b301" stroke="#d99b00" />
                    </svg>
                  </div>
                </div>

                {/* step markers under the rail */}
                <div className="mt-3 grid grid-cols-4">
                  {steps.map((s, i) => (
                    <div key={s.n} className="flex flex-col items-center gap-1.5">
                      <span
                        className={clsx(
                          "grid size-6 place-items-center rounded-full border-2 text-[0.6rem] font-bold transition-colors duration-500",
                          i < active
                            ? "border-gold-500 bg-gold-500 text-white"
                            : i === active
                              ? "border-hi-500 bg-white text-hi-500 ring-4 ring-hi-500/15"
                              : "border-ink-700 bg-white text-ink-600",
                        )}
                      >
                        {i < active ? "✓" : i + 1}
                      </span>
                      <span
                        className={clsx(
                          "hidden text-center font-mono text-[0.6rem] sm:block",
                          i === active ? "text-hi-500" : "text-ink-600",
                        )}
                      >
                        {PHASE_LABELS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
