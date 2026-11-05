"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import gsap from "gsap";
import { CAMERA_FOV, MAX_DPR } from "./config";
import { loadShipGLTF, prepareShip, type PreparedShip } from "./loadShip";
import { intro, timeline } from "./state";
import { ui, useUI } from "./ui-store";
import { Ship } from "./components/Ship";
import { CameraRig } from "./components/CameraRig";
import { Water } from "./components/Water";
import { Debris } from "./components/Debris";
import { Buoys } from "./components/Buoys";
import { Atmosphere } from "./components/Atmosphere";
import { AnnotationProjector } from "./components/AnnotationProjector";

export default function SceneCanvas() {
  const [ship, setShip] = useState<PreparedShip | null>(null);
  const mobile = useUI((s) => s.mobile);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, MAX_DPR));
  // События указателя слушаем на секции разбора: canvas под контентом и не перехватывает скролл.
  const [eventSource] = useState(() => document.getElementById("explore") ?? undefined);

  useEffect(() => {
    let cancelled = false;
    loadShipGLTF((p) => ui.set({ progress: p }))
      .then((scene) => {
        if (cancelled) return;
        const prepared = prepareShip(scene);
        setShip(prepared);
        ui.set({ progress: 1, loaded: true, missingNodes: prepared.missing });
      })
      .catch((err) => {
        console.error("[CaspianGuard] Ошибка загрузки модели", err);
        if (!cancelled) ui.set({ failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Кораблик носом вперёд выплывает из тумана.
  useEffect(() => {
    if (!ship) return;
    if (ui.get().reducedMotion) {
      intro.x = 0;
      intro.fog = 0;
      return;
    }
    const tween = gsap.to(intro, { x: 0, fog: 0, duration: 5.5, ease: "power2.out", delay: 0.2 });
    return () => {
      tween.kill();
    };
  }, [ship]);

  return (
    <Canvas
      className="scene-canvas"
      dpr={dpr}
      gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: CAMERA_FOV, near: 0.05, far: 150, position: [timeline.camX, timeline.camY, timeline.camZ] }}
      eventSource={eventSource}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Atmosphere />
      <Water lite={mobile} />
      <Debris lite={mobile} />
      <Buoys />
      {ship && <Ship ship={ship} />}
      <CameraRig />
      <AnnotationProjector />
    </Canvas>
  );
}
