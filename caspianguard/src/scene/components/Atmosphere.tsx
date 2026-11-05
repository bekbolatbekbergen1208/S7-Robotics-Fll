"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { COLORS } from "../config";
import { intro, timeline } from "../state";
import { makeGlowTexture } from "../glowTexture";

/** Туман, фон, локальное окружение RoomEnvironment через PMREM (без CDN) и свет. */
export function Atmosphere() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new THREE.FogExp2(COLORS.fog, timeline.fog), []);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 1.0;
    scene.background = new THREE.Color(COLORS.background);
    scene.fog = fog;
    room.dispose();
    pmrem.dispose();
    return () => {
      env.dispose();
      scene.environment = null;
      scene.fog = null;
    };
  }, [gl, scene, fog]);

  useFrame(() => {
    fog.density = timeline.fog + intro.fog;
  });

  return (
    <>
      <hemisphereLight args={["#9fd6e6", "#03121a", 0.35]} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} color="#f2f8ff" />
      {/* Мягкий фронтальный свет со стороны камеры, чтобы белые борта не уходили в тень. */}
      <directionalLight position={[2, 1.5, 6]} intensity={0.9} color="#e6f3ff" />
      {/* Холодный контровой свет сзади: обводит силуэт и не даёт бортам слиться с фоном. */}
      <directionalLight position={[-5, 2.5, -4]} intensity={0.9} color="#5fd8e8" />
      <EndGlow />
    </>
  );
}

/** Свет на горизонте, к которому уплывает кораблик в финале. */
function EndGlow() {
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        color: "#9eeff7",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  useFrame(() => {
    material.opacity = Math.min(1, timeline.glow * 1.1);
  });
  return <sprite material={material} position={[40, 2.4, 0]} scale={[52, 30, 1]} />;
}
