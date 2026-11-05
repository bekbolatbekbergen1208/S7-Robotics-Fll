// Мутируемое состояние сцены. Его меняют GSAP и обработчики ввода,
// а useFrame читает каждый кадр. React-перерисовки здесь не участвуют.

import type { Camera, Object3D } from "three";

/** Значения, которые двигает скролл-timeline (см. keyframes.ts). */
export const timeline = {
  camX: 2.5,
  camY: 1.1,
  camZ: 2.4,
  tgtX: 0,
  tgtY: 0.38,
  tgtZ: 0,
  /** Сдвиг кадра в долях экрана: кораблик уходит вправо (+) или вверх (+), освобождая место тексту. */
  shiftX: 0,
  shiftY: 0,
  shipX: 0,
  shipZ: 0,
  shipRotY: 0,
  lift: 0,
  speed: 0.35,
  explode: 0,
  solar: 0,
  /** Видимость подписи «Следующий этап» у солнечных панелей. */
  solarTag: 0,
  collect: 0,
  hlConveyor: 0,
  hlBasket: 0,
  hlThrusters: 0,
  buoys: 0,
  wake: 0.7,
  glow: 0,
  debris: 1,
  fog: 0.05,
};

export type TimelineKey = keyof typeof timeline;
export const TIMELINE_KEYS = Object.keys(timeline) as TimelineKey[];

/** Выплывание из тумана при загрузке (не зависит от скролла). */
export const intro = { x: -9, fog: 0.07 };

/** Ввод пользователя в режиме детали: целевые углы и приближение. */
export const inspect = { yaw: 0, pitch: 0, zoom: 1 };

/** Текущая поза корабля (обновляет Ship, читают камера и подписи). */
export const shipPose = { root: null as Object3D | null, camera: null as Camera | null };

/** Начало закреплённой секции разбора в пикселях скролла (для «Собрать корабль»). */
export const scrollMarks = { exploreStart: 0, exploreEnd: 0 };
