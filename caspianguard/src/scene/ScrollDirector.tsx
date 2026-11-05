"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { KEYFRAMES } from "./keyframes";
import { Vector3 } from "three";
import { scrollMarks, shipPose, timeline, TIMELINE_KEYS, type TimelineKey } from "./state";
import { ui, useUI } from "./ui-store";
import { setLenis } from "./scroll";

gsap.registerPlugin(ScrollTrigger);

type Snapshot = Record<TimelineKey, number>;

const DEFAULTS: Snapshot = { ...timeline };

/** Переводит ключевые кадры в позиции скролла (px) и полные снимки состояния. */
function resolveKeyframes(mobile: boolean, pin: ScrollTrigger, max: number) {
  const carry: Snapshot = { ...DEFAULTS };
  const resolved = KEYFRAMES.map((kf, order) => {
    let top: number;
    let height: number;
    if (kf.section === "explore") {
      top = pin.start;
      height = pin.end - pin.start;
    } else {
      const el = document.getElementById(kf.section);
      if (!el) console.warn(`[CaspianGuard] Нет секции #${kf.section} для ключевого кадра`);
      top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
      height = el ? el.offsetHeight : 0;
    }
    const cam = (mobile && kf.camMobile) || kf.cam;
    if (cam) [carry.camX, carry.camY, carry.camZ] = cam;
    if (kf.target) [carry.tgtX, carry.tgtY, carry.tgtZ] = kf.target;
    const shift = mobile ? kf.shiftMobile : kf.shift;
    if (shift) [carry.shiftX, carry.shiftY] = shift;
    if (kf.values) Object.assign(carry, kf.values);
    const pos = Math.min(max, Math.max(0, top + kf.at * height));
    return { pos, order, ease: kf.ease, values: { ...carry } };
  });
  return resolved.sort((a, b) => a.pos - b.pos || a.order - b.order);
}

/**
 * Одна GSAP timeline со scrub связывает скролл с камерой и кораблём.
 * Секция разбора закрепляется через ScrollTrigger pin.
 */
export function ScrollDirector() {
  const mobile = useUI((s) => s.mobile);
  const reduced = useUI((s) => s.reducedMotion);

  // Плавный скролл Lenis, синхронизированный с ScrollTrigger.
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.11 });
    setLenis(lenis);
    if (ui.get().selected) lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  useEffect(() => {
    const explore = document.getElementById("explore");
    if (!explore) return;
    const pin = ScrollTrigger.create({
      trigger: explore,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onToggle: (self) => ui.set({ explorePinned: self.isActive }),
    });

    let master: ScrollTrigger | null = null;
    let tl: gsap.core.Timeline | null = null;
    let building = false;

    const build = () => {
      if (building) return;
      building = true;
      master?.kill();
      tl?.kill();
      const max = ScrollTrigger.maxScroll(window);
      scrollMarks.exploreStart = pin.start;
      scrollMarks.exploreEnd = pin.end;
      const frames = resolveKeyframes(mobile, pin, max);
      Object.assign(timeline, frames[0].values);
      tl = gsap.timeline({ paused: true });
      for (let i = 0; i < frames.length - 1; i++) {
        const from = frames[i];
        const to = frames[i + 1];
        const duration = Math.max(to.pos - from.pos, 0.001) / max;
        tl.fromTo(
          timeline,
          { ...from.values },
          { ...to.values, duration, ease: to.ease ?? "sine.inOut", immediateRender: false },
          from.pos / max,
        );
      }
      tl.to({}, { duration: 0.001 }, Math.max(0, 1 - 0.001));
      master = ScrollTrigger.create({
        animation: tl,
        start: 0,
        end: max,
        scrub: reduced ? true : 0.7,
      });
      building = false;
    };

    ScrollTrigger.addEventListener("refresh", build);
    ScrollTrigger.refresh();
    if (!master) build();
    // Повторный пересчёт, когда загрузятся шрифты и изменится высота секций.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.removeEventListener("refresh", build);
      master?.kill();
      tl?.kill();
      pin.kill(true);
      ui.set({ explorePinned: false });
    };
  }, [mobile, reduced]);

  return null;
}

// Только в dev: window.__cg для отладки и автотестов (screenOf проецирует центр группы на экран).
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __cg: unknown }).__cg = {
    timeline,
    TIMELINE_KEYS,
    ui,
    shipPose,
    screenOf(id: string) {
      const { root, camera } = shipPose;
      const pivot = root?.getObjectByName(`pivot_${id}`);
      if (!pivot || !camera) return null;
      const v = pivot.getWorldPosition(new Vector3()).project(camera);
      return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, rot: [pivot.rotation.x, pivot.rotation.y], pos: pivot.position.toArray() };
    },
  };
}
