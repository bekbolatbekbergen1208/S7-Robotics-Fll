"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { getPart, type PartId } from "@/content/parts";
import { inspect, shipPose, timeline } from "../state";
import { ui } from "../ui-store";
import { INSPECT_LIMITS } from "../config";

const { damp, clamp } = THREE.MathUtils;

/**
 * Камера всегда плавно догоняет цель: ключевые кадры скролла или ракурс выбранной детали.
 * Цель пересчитывается каждый кадр, поэтому быстрые клики просто меняют цель и не ломают полёт.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const rig = useRef({
    pos: new THREE.Vector3(timeline.camX, timeline.camY, timeline.camZ),
    tgt: new THREE.Vector3(timeline.tgtX, timeline.tgtY, timeline.tgtZ),
    sx: 0,
    sy: 0,
    modeAt: -10,
    last: null as PartId | null,
    goalPos: new THREE.Vector3(),
    goalTgt: new THREE.Vector3(),
  });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = ui.get();
    const r = rig.current;
    const selected = s.selected;
    const changed = selected !== r.last;
    if (changed) r.modeAt = t;
    r.last = selected;

    let sx: number;
    let sy: number;
    if (selected && shipPose.root) {
      const part = getPart(selected);
      const root = shipPose.root;
      root.updateMatrixWorld();
      r.goalTgt.set(...part.cameraTarget);
      root.localToWorld(r.goalTgt);
      r.goalPos.set(...part.cameraPosition);
      root.localToWorld(r.goalPos);
      const aspect = size.width / Math.max(1, size.height);
      const fit = s.mobile ? Math.max(1.1, 1.05 / aspect) : Math.max(1.3, 2 / aspect);
      const zoom = clamp(inspect.zoom, INSPECT_LIMITS.zoomMin, INSPECT_LIMITS.zoomMax);
      r.goalPos.sub(r.goalTgt).multiplyScalar(zoom * fit).add(r.goalTgt);
      // Деталь в центре свободной области: на десктопе между списком и карточкой, на телефоне над шторкой.
      sx = s.mobile ? 0 : -0.04;
      sy = s.mobile ? 0.2 : 0.02;
    } else {
      r.goalPos.set(timeline.camX, timeline.camY, timeline.camZ);
      r.goalTgt.set(timeline.tgtX, timeline.tgtY, timeline.tgtZ);
      sx = timeline.shiftX;
      sy = timeline.shiftY;
    }

    // Без анимаций (prefers-reduced-motion) детали переключаются без полёта камеры.
    const instant = s.reducedMotion && (selected !== null || t - r.modeAt < 0.05);
    const lambda = instant ? 1e3 : t - r.modeAt < 1.8 ? 2.6 : 7;
    r.pos.x = damp(r.pos.x, r.goalPos.x, lambda, dt);
    r.pos.y = damp(r.pos.y, r.goalPos.y, lambda, dt);
    r.pos.z = damp(r.pos.z, r.goalPos.z, lambda, dt);
    r.tgt.x = damp(r.tgt.x, r.goalTgt.x, lambda, dt);
    r.tgt.y = damp(r.tgt.y, r.goalTgt.y, lambda, dt);
    r.tgt.z = damp(r.tgt.z, r.goalTgt.z, lambda, dt);
    r.sx = damp(r.sx, sx, lambda, dt);
    r.sy = damp(r.sy, sy, lambda, dt);

    shipPose.camera = camera;
    camera.position.copy(r.pos);
    camera.lookAt(r.tgt);
    const w = size.width;
    const h = size.height;
    camera.setViewOffset(w, h, -r.sx * w, r.sy * h, w, h);
  });

  return null;
}
