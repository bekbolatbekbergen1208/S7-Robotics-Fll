"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { COLORS } from "../config";
import { timeline } from "../state";
import { buoyPositions } from "../anchors";
import { makeGlowTexture } from "../glowTexture";

/** Шесть буёв Core Values загораются по очереди вокруг корабля. */
export function Buoys() {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => buoyPositions(), []);
  const glow = useMemo(() => makeGlowTexture(), []);
  const parts = useMemo(
    () =>
      positions.map(() => ({
        lamp: new THREE.MeshStandardMaterial({ color: "#0b3a40", emissive: COLORS.glow, emissiveIntensity: 0 }),
        sprite: new THREE.SpriteMaterial({ map: glow, color: COLORS.glow, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      })),
    [positions, glow],
  );
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9e4e6", roughness: 0.4 }), []);
  const band = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0a6f7a", roughness: 0.5 }), []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const b = timeline.buoys;
    g.visible = b > 0.001;
    if (!g.visible) return;
    g.children.forEach((child, i) => {
      const lit = THREE.MathUtils.clamp(b * 6 - i, 0, 1);
      const rise = THREE.MathUtils.clamp(b * 4, 0, 1);
      child.position.y = -0.5 + rise * 0.5 + Math.sin(t * 1.4 + i) * 0.02;
      child.rotation.z = Math.sin(t * 1.1 + i * 2) * 0.06;
      parts[i].lamp.emissiveIntensity = lit * (3 + Math.sin(t * 3 + i) * 0.6);
      parts[i].sprite.opacity = lit * 0.85;
    });
  });

  return (
    <group ref={group} visible={false}>
      {positions.map((p, i) => (
        <group key={i} position={[p[0], 0, p[2]]}>
          <mesh material={body} position-y={0.06}>
            <cylinderGeometry args={[0.13, 0.17, 0.3, 12]} />
          </mesh>
          <mesh material={band} position-y={0.16}>
            <cylinderGeometry args={[0.135, 0.135, 0.06, 12]} />
          </mesh>
          <mesh material={parts[i].lamp} position-y={0.3}>
            <sphereGeometry args={[0.06, 12, 8]} />
          </mesh>
          <sprite material={parts[i].sprite} position-y={0.3} scale={0.9} />
        </group>
      ))}
    </group>
  );
}
