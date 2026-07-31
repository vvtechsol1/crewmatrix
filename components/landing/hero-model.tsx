"use client";

import { useEffect, useRef } from "react";

/**
 * The finished CrewMatrix building as a floating hero diorama: blue steel, glass,
 * the gold topping-out beam, and the crane idling beside it. Slow auto-rotate,
 * a gentle hover bob, and pointer tilt from the hero section.
 *
 * Desktop only (the hero is copy-first on phones), transparent canvas over the
 * hero photo, three.js loaded async so it never blocks the page. Reduced
 * motion gets a single static render.
 */
export function HeroModel() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (disposed || !mount) return;

      /* eslint-disable @typescript-eslint/no-explicit-any */
      type M3 = any;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / mount.clientHeight, 0.1, 60);
      camera.position.set(6.8, 4.0, 9.6);
      camera.lookAt(0, 1.55, 0);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x8fa3c8, 1.35));
      const sun = new THREE.DirectionalLight(0xfff3d6, 1.9);
      sun.position.set(6, 9, 5);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x6d8dff, 0.8);
      rim.position.set(-6, 3, -6);
      scene.add(rim);

      const M = {
        steel: new THREE.MeshStandardMaterial({ color: 0x3558e8, roughness: 0.4, metalness: 0.4 }),
        navy: new THREE.MeshStandardMaterial({ color: 0x16346c, roughness: 0.6, metalness: 0.2 }),
        slab: new THREE.MeshStandardMaterial({ color: 0xf0f3fa, roughness: 0.9 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0xd9e0ec, roughness: 0.95 }),
        gold: new THREE.MeshStandardMaterial({ color: 0xf5b301, roughness: 0.28, metalness: 0.6 }),
        glass: new THREE.MeshStandardMaterial({
          color: 0xaec6ff,
          roughness: 0.12,
          metalness: 0.1,
          transparent: true,
          opacity: 0.4,
        }),
      };

      const world = new THREE.Group();
      scene.add(world);

      const put = (geo: M3, mat: M3, x: number, y: number, z: number, parent: M3 = world) => {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
      };

      /* ------------------------- finished building ------------------------ */
      const LVLS = 3;
      const H = 1.05;
      const S = 1.25;

      put(new THREE.BoxGeometry(4.5, 0.22, 4.5), M.concrete, 0, 0.11, 0);
      [-1, 1].forEach((ix) =>
        [-1, 1].forEach((iz) => put(new THREE.BoxGeometry(0.6, 0.3, 0.6), M.navy, ix * 1.6, 0.15, iz * 1.6)),
      );

      const colGeo = new THREE.BoxGeometry(0.11, H, 0.11);
      for (let lvl = 0; lvl < LVLS; lvl++) {
        for (let ix = -1; ix <= 1; ix++)
          for (let iz = -1; iz <= 1; iz++) put(colGeo, M.steel, ix * S, 0.22 + lvl * H + H / 2, iz * S);

        const y = 0.22 + (lvl + 1) * H;
        const bx = new THREE.BoxGeometry(2 * S + 0.2, 0.09, 0.09);
        const bz = new THREE.BoxGeometry(0.09, 0.09, 2 * S + 0.2);
        [-1, 1].forEach((s) => {
          put(bx, M.steel, 0, y, s * S);
          put(bz, M.steel, s * S, y, 0);
        });

        put(new THREE.BoxGeometry(3.1, 0.1, 3.1), M.slab, 0, y + 0.05, 0);
        put(new THREE.BoxGeometry(2 * S - 0.1, H - 0.18, 0.04), M.glass, 0, 0.22 + lvl * H + H / 2, S - 0.02);
        put(new THREE.BoxGeometry(0.04, H - 0.18, 2 * S - 0.1), M.glass, S - 0.02, 0.22 + lvl * H + H / 2, 0);
      }

      const roofY = 0.22 + LVLS * H + 0.14;
      put(new THREE.BoxGeometry(3.3, 0.12, 3.3), M.slab, 0, roofY, 0);
      put(new THREE.BoxGeometry(3.3, 0.14, 0.08), M.navy, 0, roofY + 0.12, 1.61);
      put(new THREE.BoxGeometry(3.3, 0.14, 0.08), M.navy, 0, roofY + 0.12, -1.61);
      put(new THREE.BoxGeometry(0.08, 0.14, 3.3), M.navy, 1.61, roofY + 0.12, 0);
      put(new THREE.BoxGeometry(0.08, 0.14, 3.3), M.navy, -1.61, roofY + 0.12, 0);
      put(new THREE.BoxGeometry(2.4, 0.14, 0.2), M.gold, 0, roofY + 0.28, 0);
      const beacon = put(new THREE.SphereGeometry(0.09, 16, 16), M.gold, 0, roofY + 0.5, 0);

      /* ------------------------------- crane ------------------------------ */
      const crane = new THREE.Group();
      crane.position.set(-2.9, 0, -2.2);
      world.add(crane);
      put(new THREE.BoxGeometry(0.7, 0.18, 0.7), M.concrete, 0, 0.09, 0, crane);
      put(new THREE.BoxGeometry(0.16, 4.6, 0.16), M.gold, 0, 2.4, 0, crane);
      const jib = new THREE.Group();
      jib.position.y = 4.55;
      crane.add(jib);
      put(new THREE.BoxGeometry(3.4, 0.12, 0.12), M.gold, 1.3, 0, 0, jib);
      put(new THREE.BoxGeometry(1.1, 0.12, 0.12), M.navy, -0.85, 0, 0, jib);
      put(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 6), M.navy, 2.6, -0.8, 0, jib);

      // soft shadow puck so the diorama reads as grounded, not pasted
      const shadow = put(
        new THREE.CircleGeometry(3.4, 40),
        new THREE.MeshBasicMaterial({ color: 0x061229, transparent: true, opacity: 0.28 }),
        0,
        0.005,
        0,
      );
      shadow.rotation.x = -Math.PI / 2;

      /* ------------------------------- drive ------------------------------ */
      const pointer = { x: 0, y: 0 };
      const section = mount.closest("section");
      function onPointer(e: PointerEvent) {
        if (e.pointerType !== "mouse" || !section) return;
        const r = section.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointer.y = ((e.clientY - r.top) / r.height - 0.5) * -1;
      }
      if (!reduced) section?.addEventListener("pointermove", onPointer);

      let inView = true;
      let rafId = 0;
      const clock = new THREE.Clock();

      function frame() {
        const t = clock.getElapsedTime();
        // sway, not spin — the crane's jib never leaves the frame
        world.rotation.y = Math.sin(t * 0.18) * 0.42 + pointer.x * 0.22;
        world.position.y = Math.sin(t * 0.8) * 0.07;
        world.rotation.x = pointer.y * 0.05;
        jib.rotation.y = Math.sin(t * 0.25) * 0.6 + 0.3;
        beacon.scale.setScalar(1 + Math.sin(t * 2.2) * 0.14);
        renderer.render(scene, camera);
        if (inView && !reduced) rafId = requestAnimationFrame(frame);
      }

      const io = new IntersectionObserver(([e]) => {
        const was = inView;
        inView = e.isIntersecting;
        if (inView && !was && !reduced) rafId = requestAnimationFrame(frame);
      });
      io.observe(mount);

      const ro = new ResizeObserver(() => {
        if (!mount) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      });
      ro.observe(mount);

      renderer.render(scene, camera);
      if (!reduced) rafId = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        io.disconnect();
        ro.disconnect();
        section?.removeEventListener("pointermove", onPointer);
        scene.traverse((o) => {
          const mesh = o as M3;
          if (mesh.geometry) mesh.geometry.dispose();
        });
        Object.values(M).forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="relative aspect-square w-full max-w-[30rem]">
        {/* gradient circle stage the diorama floats on */}
        <div className="absolute inset-0 rounded-full border border-white/15 bg-[radial-gradient(circle_at_35%_28%,rgb(61_88_232/0.4),rgb(14_42_92/0.18)_52%,transparent_74%)]" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_72%_78%,rgb(245_179_1/0.22),transparent_55%)]" />
        <div className="absolute inset-5 rounded-full border border-white/10" />
        <div ref={mountRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
