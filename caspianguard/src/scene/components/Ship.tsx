"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { EXPLORE_PARTS, type PartId } from "@/content/parts";
import {
  COLORS,
  CONVEYOR,
  EXPLODE_LIFT,
  EXPLODE_STAGGER,
  EXPLORE_INTERACTIVE_AT,
  INSPECT_LIMITS,
  WATERLINE,
} from "../config";
import type { MaterialRecord, PartRuntime, PreparedShip } from "../loadShip";
import { inspect, intro, shipPose, timeline } from "../state";
import { ui, useUI } from "../ui-store";
import { selectPart } from "../actions";

const { clamp, damp, smoothstep, lerp } = THREE.MathUtils;
const noRaycast = () => {};
const HIGHLIGHT = new THREE.Color(COLORS.highlight).multiplyScalar(0.55);

const conveyorDir = new THREE.Vector3(
  CONVEYOR.top[0] - CONVEYOR.bottom[0],
  CONVEYOR.top[1] - CONVEYOR.bottom[1],
  0,
).normalize();

function applyOpacity(part: { materials: MaterialRecord[] }, opacity: number) {
  const transparent = opacity < 0.999;
  for (const rec of part.materials) {
    const m = rec.material;
    m.opacity = rec.opacity * opacity;
    if (m.transparent !== (transparent || rec.transparent)) {
      m.transparent = transparent || rec.transparent;
      m.needsUpdate = true;
    }
    m.depthWrite = transparent ? false : rec.depthWrite;
  }
}

function applyHighlight(part: PartRuntime, h: number) {
  for (const rec of part.materials) {
    rec.material.emissive.copy(rec.emissive).lerp(HIGHLIGHT, h);
    rec.material.emissiveIntensity = lerp(rec.emissiveIntensity, 1, h);
  }
}

function partFromObject(o: THREE.Object3D | null): PartId | null {
  while (o) {
    if (o.userData.partId) return o.userData.partId as PartId;
    o = o.parent;
  }
  return null;
}

const isOverUI = (e: ThreeEvent<PointerEvent | MouseEvent>) =>
  !!(e.nativeEvent.target as HTMLElement | null)?.closest?.("[data-ui]");

export function Ship({ ship }: { ship: PreparedShip }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const interactive = useUI((s) => s.explorePinned && (s.exploreInteractive || s.selected !== null));
  const anim = useRef({ lift: 0, solar: 0, prop: 0, modeAt: -10, lastSelected: null as PartId | null });
  const order = useMemo(() => EXPLORE_PARTS.map((p) => p.id), []);

  // Прогрев шейдеров прозрачных вариантов, чтобы первое растворение деталей не дёргало кадр.
  useEffect(() => {
    shipPose.root = ship.root;
    const all = [...ship.parts.values()];
    all.forEach((p) => applyOpacity(p, 0.5));
    gl.compile(scene, camera);
    all.forEach((p) => applyOpacity(p, 1));
    return () => {
      shipPose.root = null;
    };
  }, [ship, gl, scene, camera]);

  useEffect(() => {
    if (!interactive) ui.set({ hovered: null });
  }, [interactive]);

  // Курсор-указатель над деталью.
  useEffect(() => {
    const unsubscribe = ui.subscribe(() => {
      const { hovered, explorePinned } = ui.get();
      document.body.style.cursor = hovered && explorePinned ? "pointer" : "";
    });
    return () => {
      unsubscribe();
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = ui.get();
    const a = anim.current;
    const selected = s.selected;
    const inspecting = selected !== null;
    if (selected !== a.lastSelected && (selected === null || a.lastSelected === null)) a.modeAt = t;
    a.lastSelected = selected;
    const transition = t - a.modeAt < 1.6;
    const snap = s.reducedMotion ? 40 : 0;

    // Поза корабля: ватерлиния, покачивание, подъём над водой при разборе.
    a.lift = damp(a.lift, inspecting ? EXPLODE_LIFT : timeline.lift, snap || 4, dt);
    const liftK = clamp(a.lift / EXPLODE_LIFT, 0, 1);
    const bob = (1 - liftK) * (s.reducedMotion ? 0.3 : 1);
    const root = ship.root;
    root.position.set(
      timeline.shipX + intro.x,
      -WATERLINE + a.lift + Math.sin(t * 1.1) * 0.012 * bob,
      timeline.shipZ,
    );
    root.rotation.set(Math.sin(t * 0.9) * 0.016 * bob, timeline.shipRotY, Math.sin(t * 0.7 + 1) * 0.022 * bob);

    // Разбор: группы разлетаются по очереди.
    const explode = inspecting ? 1 : timeline.explode;
    const span = 1 - (order.length - 1) * EXPLODE_STAGGER;
    const follow = snap || (transition ? 4.5 : 12);
    order.forEach((id, i) => {
      const p = ship.parts.get(id);
      if (!p) return;
      const goal = smoothstep(clamp((explode - i * EXPLODE_STAGGER) / span, 0, 1), 0, 1);
      p.t = damp(p.t, goal, follow, dt);
      p.pivot.position.copy(p.base).addScaledVector(p.offset, p.t);

      // Выбранная деталь вращается пользователем; остальные возвращаются в исходный поворот.
      const yaw = selected === id ? clamp(inspect.yaw, -INSPECT_LIMITS.yaw, INSPECT_LIMITS.yaw) : 0;
      const pitch = selected === id ? clamp(inspect.pitch, -INSPECT_LIMITS.pitch, INSPECT_LIMITS.pitch) : 0;
      p.pivot.rotation.y = damp(p.pivot.rotation.y, yaw, snap || 6, dt);
      p.pivot.rotation.x = damp(p.pivot.rotation.x, pitch, snap || 6, dt);

      const opacityGoal = inspecting && selected !== id ? 0.06 : 1;
      p.opacity = damp(p.opacity, opacityGoal, snap || 6, dt);
      if (Math.abs(p.opacity - p.appliedOpacity) > 0.002) {
        const value = p.opacity > 0.997 ? 1 : p.opacity;
        applyOpacity(p, value);
        p.appliedOpacity = value;
        p.pivot.visible = value > 0.015;
      }

      const raycastOn = interactive && (!inspecting || selected === id) && p.opacity > 0.5;
      if (raycastOn !== p.raycastOn) {
        p.raycastOn = raycastOn;
        for (const m of p.meshes) m.raycast = raycastOn ? THREE.Mesh.prototype.raycast : noRaycast;
      }

      const scrollHl =
        id === "conveyor" ? timeline.hlConveyor : id === "basket" ? timeline.hlBasket : id === "thrusters" ? timeline.hlThrusters : 0;
      const hlGoal = Math.max(scrollHl, s.hovered === id ? 0.5 : 0, selected === id ? 0.1 : 0);
      p.highlight = damp(p.highlight, hlGoal, 8, dt);
      if (Math.abs(p.highlight - p.appliedHighlight) > 0.003) {
        applyHighlight(p, p.highlight);
        p.appliedHighlight = p.highlight;
      }
    });

    // Солнечные панели: скрыты, опускаются на корму только в секции «Будущее».
    const solar = ship.parts.get("solar");
    if (solar) {
      a.solar = damp(a.solar, inspecting ? 0 : timeline.solar, snap || 6, dt);
      solar.pivot.position.copy(solar.base).y += (1 - a.solar) * 0.6;
      if (Math.abs(a.solar - solar.appliedOpacity) > 0.002) {
        const value = a.solar > 0.997 ? 1 : a.solar < 0.003 ? 0 : a.solar;
        applyOpacity(solar, value);
        solar.appliedOpacity = value;
        solar.pivot.visible = value > 0.01;
      }
      if (solar.raycastOn) {
        solar.raycastOn = false;
        for (const m of solar.meshes) m.raycast = noRaycast;
      }
    }

    // Анимация сбора: бутылки едут по конвейеру и исчезают над корзиной.
    ship.trashRoot.visible = !inspecting && liftK < 0.05 && timeline.explode < 0.02;
    const collect = timeline.collect;
    ship.conveyorTrash.forEach((item, i) => {
      const local = clamp((collect - i * 0.12) / 0.76, 0, 1);
      const distance = (item.base.x - CONVEYOR.dropX) / -conveyorDir.x;
      item.pivot.position.copy(item.base).addScaledVector(conveyorDir, distance * smoothstep(local, 0, 1));
      const scale = 1 - smoothstep(local, 0.82, 1);
      item.pivot.position.y += Math.sin(Math.min(1, local / 0.82) * Math.PI) * 0.015;
      item.pivot.scale.setScalar(Math.max(scale, 0.0001));
      item.pivot.visible = scale > 0.01;
    });
    ship.basketTrash.forEach((item, i) => {
      const appear = smoothstep(collect, 0.84 + i * 0.04, 0.95 + i * 0.02);
      item.pivot.scale.setScalar(Math.max(appear, 0.0001));
      item.pivot.visible = appear > 0.01;
    });

    // Винты вращаются вокруг собственной оси X в разные стороны.
    a.prop += dt * (s.reducedMotion ? 1 : 2 + timeline.speed * 16);
    for (const p of ship.propellers) p.pivot.rotation.x = a.prop * p.dir;

    // Маяк мягко пульсирует.
    if (ship.beacon) {
      const nav = ship.parts.get("navigation");
      const pulse = 0.55 + 0.45 * Math.sin(t * 2.4);
      ship.beacon.material.emissiveIntensity = lerp(ship.beacon.emissiveIntensity * (0.5 + pulse * 1.3), 1, nav?.highlight ?? 0);
    }

    // На телефоне тяжёлый трос на барабане (27 648 треугольников) виден только при разборе.
    if (ship.woundLine) ship.woundLine.visible = !s.mobile || liftK > 0.3 || inspecting;

    ui.set({ exploreInteractive: s.explorePinned && timeline.explode >= EXPLORE_INTERACTIVE_AT });
  });

  const handlers = interactive
    ? {
        onPointerMove: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (e.pointerType !== "mouse") return;
          ui.set({ hovered: isOverUI(e) ? null : partFromObject(e.object) });
        },
        onPointerOut: () => ui.set({ hovered: null }),
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (isOverUI(e) || e.delta > 6) return;
          const id = partFromObject(e.object);
          if (id && id !== "solar") selectPart(id);
        },
      }
    : {};

  return <primitive object={ship.root} {...handlers} />;
}
