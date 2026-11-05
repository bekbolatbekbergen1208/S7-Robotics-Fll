"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ANNOTATIONS, annotationEls } from "../annotations";
import { shipPose } from "../state";

/** Проецирует 3D-точки подписей на экран и двигает DOM-элементы без React-перерисовок. */
export function AnnotationProjector() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);
  const last = useMemo(() => new Map<string, number>(), []);

  useFrame(() => {
    for (const a of ANNOTATIONS) {
      const el = annotationEls.get(a.id);
      if (!el) continue;
      let vis = a.visibility();
      if (vis > 0.005) {
        v.set(...a.point);
        if (a.space === "ship") {
          if (!shipPose.root) vis = 0;
          else shipPose.root.localToWorld(v);
        }
        v.project(camera);
        if (v.z > 1) vis = 0;
        const x = (v.x * 0.5 + 0.5) * size.width;
        const y = (-v.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
      if (last.get(a.id) !== vis) {
        el.style.opacity = vis.toFixed(3);
        el.style.visibility = vis > 0.005 ? "visible" : "hidden";
        last.set(a.id, vis);
      }
    }
  });

  return null;
}
