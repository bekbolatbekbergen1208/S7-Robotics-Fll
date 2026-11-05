// Реестр DOM-подписей, привязанных к 3D-точкам. Позиции пишет AnnotationProjector внутри canvas.

import type { Vec3 } from "@/content/parts";
import { ANCHORS } from "./config";
import { buoyPositions } from "./anchors";
import { timeline } from "./state";

export interface AnnotationDef {
  id: string;
  /** Точка в координатах модели (ship) или мировая (world). */
  space: "ship" | "world";
  point: Vec3;
  visibility: () => number;
}

const buoys = buoyPositions();

export const ANNOTATIONS: AnnotationDef[] = [
  { id: "conveyor", space: "ship", point: ANCHORS.conveyor, visibility: () => timeline.hlConveyor },
  { id: "basket", space: "ship", point: ANCHORS.basket, visibility: () => timeline.hlBasket },
  { id: "thrusters", space: "ship", point: ANCHORS.thrusters, visibility: () => timeline.hlThrusters },
  { id: "solar", space: "ship", point: ANCHORS.solar, visibility: () => timeline.solarTag },
  ...buoys.map((p, i) => ({
    id: `value-${i}`,
    space: "world" as const,
    point: [p[0], 0.55, p[2]] as Vec3,
    visibility: () => Math.min(1, Math.max(0, timeline.buoys * 6 - i)),
  })),
];

export const annotationEls = new Map<string, HTMLElement>();
