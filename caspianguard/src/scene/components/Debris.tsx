"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { timeline } from "../state";

// Простой низкополигональный мусор: бутылки, банки и обрывки пакетов. Один InstancedMesh на форму.
const KINDS = [
  { geometry: () => new THREE.CylinderGeometry(0.035, 0.035, 0.21, 6).rotateZ(Math.PI / 2), colors: ["#2f6f7c", "#7d8b8c", "#62784c"] },
  { geometry: () => new THREE.CylinderGeometry(0.03, 0.03, 0.11, 7).rotateZ(Math.PI / 2), colors: ["#6f7a7e", "#8a3f31"] },
  { geometry: () => new THREE.IcosahedronGeometry(0.09, 0).scale(1, 0.22, 0.8), colors: ["#8d8a7e", "#475257", "#8a7b3c"] },
];

const RANGE = 11;

function rand(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function DebrisKind({ kind, count, seed }: { kind: (typeof KINDS)[number]; count: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => kind.geometry(), [kind]);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(seed * 100 + i * 7 + k);
        const radius = 1.6 + r(1) * 8;
        const angle = r(2) * Math.PI * 2;
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius * 0.8,
          rot: r(3) * Math.PI * 2,
          phase: r(4) * Math.PI * 2,
          scale: 0.75 + r(5) * 0.6,
          color: new THREE.Color(kind.colors[Math.floor(r(6) * kind.colors.length)]),
        };
      }),
    [count, kind, seed],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const flow = useRef(0);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!mesh.instanceColor) {
      items.forEach((it, i) => mesh.setColorAt(i, it.color));
      mesh.instanceColor!.needsUpdate = true;
    }
    const t = state.clock.elapsedTime;
    // Мусор сносит назад со скоростью корабля: так кажется, что корабль идёт вперёд.
    flow.current += Math.min(delta, 0.05) * timeline.speed * 0.6;
    const vis = timeline.debris;
    items.forEach((it, i) => {
      const x = ((((it.x - flow.current + RANGE) % (2 * RANGE)) + 2 * RANGE) % (2 * RANGE)) - RANGE;
      let z = it.z;
      // Не даём мусору проходить сквозь корпус.
      if (Math.abs(x) < 1.6 && Math.abs(z) < 0.95) z = Math.sign(z || 1) * 0.95;
      // У краёв диапазона мусор тонет, чтобы перенос на другую сторону был незаметен.
      const edge = 1 - THREE.MathUtils.smoothstep(Math.abs(x), RANGE - 2, RANGE);
      dummy.position.set(x, -0.012 + Math.sin(t * 1.3 + it.phase) * 0.012, z);
      dummy.rotation.set(Math.sin(t * 0.8 + it.phase) * 0.15, it.rot + t * 0.05, Math.cos(t * 0.9 + it.phase) * 0.12);
      dummy.scale.setScalar(Math.max(it.scale * vis * edge, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.7} metalness={0.05} envMapIntensity={0.5} />
    </instancedMesh>
  );
}

export function Debris({ lite }: { lite: boolean }) {
  const counts = lite ? [10, 6, 8] : [26, 14, 22];
  return (
    <group>
      {KINDS.map((kind, i) => (
        <DebrisKind key={i} kind={kind} count={counts[i]} seed={i + 1} />
      ))}
    </group>
  );
}
