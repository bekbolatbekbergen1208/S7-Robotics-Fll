// Ключевые кадры скролл-анимации. Одна GSAP timeline со scrub проходит их по порядку.
//
// section — id секции на странице; at — позиция внутри секции:
//   0 — верх секции у верхнего края экрана, 1 — секция прокручена на всю свою высоту.
//   Для закреплённой секции explore 0..1 — это весь участок закрепления.
//   Допустимы значения меньше 0 (кадр наступает раньше, пока секция въезжает).
// Не указанные поля сохраняют значение предыдущего кадра.
// Координаты мировые, в метрах: вода на y=0, корабль в начале координат, нос в +X.

import type { TimelineKey } from "./state";

type Vec3 = [number, number, number];

export interface Keyframe {
  section: string;
  at: number;
  cam?: Vec3;
  target?: Vec3;
  /** Сдвиг кадра [x, y] в долях экрана на десктопе. */
  shift?: [number, number];
  /** Сдвиг кадра на телефоне (по умолчанию кораблик чуть выше центра, текст ниже). */
  shiftMobile?: [number, number];
  /** Камера на телефоне, если нужен другой ракурс, чтобы кораблик не выпадал из кадра. */
  camMobile?: Vec3;
  ease?: string;
  values?: Partial<Record<TimelineKey, number>>;
}

export const KEYFRAMES: Keyframe[] = [
  {
    section: "top",
    at: 0,
    cam: [2.5, 1.1, 2.4],
    camMobile: [4.6, 2.3, 4.4],
    target: [0, 0.38, 0],
    shift: [0.06, 0.2],
    shiftMobile: [0, 0.2],
    values: { shipX: 0, shipRotY: 0, speed: 0.35, wake: 0.7, debris: 1, fog: 0.05 },
  },
  {
    section: "problem",
    at: -0.05,
    cam: [0.7, 0.72, 4.4],
    camMobile: [0.9, 1.5, 7.6],
    target: [0, 0.3, 0],
    shift: [0.2, 0.02],
    shiftMobile: [0, 0.2],
    values: { speed: 1, wake: 1 },
  },
  {
    section: "problem",
    at: 0.65,
    cam: [-1.3, 0.85, 4.0],
    camMobile: [-1.8, 1.6, 7.2],
    target: [0.2, 0.3, 0],
  },
  {
    section: "solution",
    at: -0.05,
    cam: [3.0, 1.75, 2.35],
    camMobile: [4.3, 2.7, 3.7],
    target: [0.55, 0.35, 0.05],
    shift: [0.2, 0],
    shiftMobile: [0, 0.18],
    values: { speed: 0.6, collect: 0, hlConveyor: 0, hlBasket: 0, hlThrusters: 0 },
  },
  { section: "solution", at: 0.1, values: { hlConveyor: 1, collect: 0 } },
  { section: "solution", at: 0.3, values: { hlConveyor: 1, hlBasket: 0, collect: 0.8 } },
  {
    section: "solution",
    at: 0.42,
    cam: [1.75, 2.5, 2.05],
    camMobile: [2.6, 4.2, 3.2],
    target: [0, 0.38, 0],
    values: { collect: 1, hlConveyor: 0, hlBasket: 1 },
  },
  { section: "solution", at: 0.58, values: { hlBasket: 1, hlThrusters: 0 } },
  {
    section: "solution",
    at: 0.72,
    cam: [-3.0, 0.95, 2.6],
    camMobile: [-4.4, 1.7, 4.1],
    target: [-0.85, 0.15, 0],
    values: { hlBasket: 0, hlThrusters: 1 },
  },
  { section: "solution", at: 0.95, values: { hlThrusters: 0 } },
  {
    section: "explore",
    at: 0,
    cam: [3.0, 1.7, 3.9],
    camMobile: [5.2, 3.2, 7.8],
    target: [0, 0.5, 0],
    shift: [0.13, 0],
    shiftMobile: [0, 0.14],
    values: { lift: 0, explode: 0, speed: 0.2, wake: 0.35 },
  },
  { section: "explore", at: 0.2, values: { lift: 0.95, explode: 0 } },
  {
    section: "explore",
    at: 0.75,
    cam: [3.1, 2.3, 4.4],
    camMobile: [7.6, 6.6, 11.6],
    target: [0.05, 1.05, 0.3],
    values: { explode: 1 },
  },
  { section: "explore", at: 1, values: { explode: 1, lift: 0.95 } },
  {
    section: "process",
    at: -0.15,
    cam: [-2.8, 1.3, 3.1],
    camMobile: [-5.0, 2.4, 5.6],
    target: [-0.2, 0.35, 0],
    shift: [-0.2, 0],
    shiftMobile: [0, 0.2],
    values: { lift: 0, explode: 0, speed: 0.6, wake: 0.8 },
  },
  {
    section: "future",
    at: -0.05,
    cam: [-2.4, 2.9, 2.9],
    camMobile: [-3.6, 4.2, 4.6],
    target: [-0.5, 0.45, 0],
    shift: [0.2, 0],
    shiftMobile: [0, 0.18],
    values: { solar: 0 },
  },
  { section: "future", at: 0.35, values: { solar: 1, solarTag: 1 } },
  { section: "future", at: 0.8, values: { solarTag: 1 } },
  {
    section: "values",
    at: -0.05,
    cam: [0.4, 7.2, 7.4],
    camMobile: [0.4, 12, 12],
    target: [0, 0, 0],
    shift: [0, 0],
    shiftMobile: [0, 0.1],
    values: { buoys: 0, speed: 0.15, wake: 0.4, solar: 1, solarTag: 0 },
  },
  { section: "values", at: 0.75, values: { buoys: 1 } },
  {
    section: "team",
    at: -0.05,
    cam: [3.8, 1.2, -2.7],
    camMobile: [6.0, 2.2, -4.8],
    target: [0, 0.4, 0],
    shift: [-0.2, 0],
    shiftMobile: [0, 0.2],
    values: { buoys: 0, speed: 0.5, wake: 0.8 },
  },
  {
    section: "final",
    at: -0.6,
    cam: [-3.4, 1.0, 1.7],
    camMobile: [-5.0, 1.4, 2.6],
    target: [6, 0.6, 0],
    shift: [0, -0.05],
    shiftMobile: [0, 0.1],
    values: { shipX: 0, glow: 0.35, debris: 1, speed: 0.8, wake: 1 },
  },
  {
    section: "final",
    at: 1,
    values: { shipX: 16, glow: 1, debris: 0.3, fog: 0.04 },
  },
];
