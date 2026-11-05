import { BUOY_RING_RADIUS } from "./config";
import type { Vec3 } from "@/content/parts";

/** Мировые позиции шести буёв Core Values. */
export function buoyPositions(): Vec3[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI * 0.62;
    return [Math.cos(a) * BUOY_RING_RADIUS, 0, Math.sin(a) * BUOY_RING_RADIUS * 0.85];
  });
}
