import type { Vec3 } from "@/content/parts";

export const MODEL_URL = "/caspianguard/models/caspianguard.glb";
/** Размер сжатого GLB. Нужен для прогресса, если сервер не отдал Content-Length. */
export const MODEL_BYTES = 1_020_260;
export const EXPECTED_NODE_COUNT = 163;

/** Высота ватерлинии в координатах модели (м). Вода находится на мировом y=0. */
export const WATERLINE = 0.2;
/** На сколько поднимается кораблик над водой в режиме разбора, чтобы были видны подводные детали. */
export const EXPLODE_LIFT = 0.95;
/** Доля прогресса разбора, после которой деталям можно кликать по модели. */
export const EXPLORE_INTERACTIVE_AT = 0.6;
/** Задержка между группами при разлёте (доля общего прогресса). */
export const EXPLODE_STAGGER = 0.045;

export const MAX_DPR = 1.5;
export const CAMERA_FOV = 40;
export const MOBILE_QUERY = "(max-width: 767px)";

export const COLORS = {
  background: "#020b13",
  fog: "#020b13",
  deepWater: "#010508",
  sky: "#0b2a3a",
  glow: "#1fe3f0",
  teal: "#0a8d99",
  amber: "#ffb547",
  highlight: "#27e6f2",
};

/** Направление ленты конвейера: от носа (x≈1.17, y≈0.18) к корзине (x≈0.34, y≈0.42). */
export const CONVEYOR = {
  bottom: [1.17, 0.18] as [number, number],
  top: [0.34, 0.42] as [number, number],
  /** Бутылки исчезают, когда проходят эту координату X. */
  dropX: 0.36,
};

/** Ограничения вращения и приближения выбранной детали. */
export const INSPECT_LIMITS = {
  yaw: Math.PI * 0.6,
  pitch: Math.PI * 0.2,
  zoomMin: 0.65,
  zoomMax: 1.45,
};

/** Точки (в координатах модели) для подписей в секции «Решение» и «Будущее». */
export const ANCHORS: Record<string, Vec3> = {
  conveyor: [0.95, 0.42, 0.3],
  basket: [-0.05, 0.47, 0.27],
  thrusters: [-1.15, 0.08, 0.46],
  solar: [-0.64, 0.5, 0.45],
};

/** Буи Core Values: кольцо вокруг корабля, радиус в метрах. */
export const BUOY_RING_RADIUS = 3.3;
