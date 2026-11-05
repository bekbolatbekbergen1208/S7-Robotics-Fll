"use client";

import { useEffect, useRef } from "react";
import { explore } from "@/content/content";
import { EXPLORE_PARTS, getPart, type PartId } from "@/content/parts";
import { assembleShip, clearSelection, selectPart, stepPart } from "@/scene/actions";
import { INSPECT_LIMITS } from "@/scene/config";
import { inspect } from "@/scene/state";
import { useUI } from "@/scene/ui-store";
import { SectionHead } from "../SectionHead";
import { StatusBadge } from "../StatusBadge";
import { Txt } from "../Txt";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function Explore() {
  const selected = useUI((s) => s.selected);
  const pinned = useUI((s) => s.explorePinned);
  const mobile = useUI((s) => s.mobile);
  const webgl = useUI((s) => s.webgl);
  const lastSelected = useRef<PartId | null>(null);
  const cardTitle = useRef<HTMLHeadingElement>(null);

  // Esc — назад, стрелки — соседняя деталь.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearSelection();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepPart(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepPart(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // Фокус: в карточку при выборе, обратно на кнопку списка при выходе.
  useEffect(() => {
    if (selected) {
      // При выборе кликом по модели переводим фокус в карточку; при выборе из списка фокус остаётся в списке.
      const fromList = document.activeElement?.closest(".explore-list");
      if (!lastSelected.current && !fromList) cardTitle.current?.focus({ preventScroll: true });
    } else if (lastSelected.current) {
      document.getElementById(`part-btn-${lastSelected.current}`)?.focus({ preventScroll: true });
    }
    lastSelected.current = selected;
  }, [selected]);

  const announcement = useUI((s) => s.announcement);
  const part = selected ? getPart(selected) : null;

  return (
    <section
      id="explore"
      aria-labelledby="explore-title"
      tabIndex={-1}
      className="explore"
      data-pinned={pinned ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
    >
      {selected && webgl === "yes" && <DragSurface />}

      <div className="explore-side">
      <div className="explore-intro scrim-left" data-ui>
        <SectionHead id="explore-title" number={explore.number} eyebrow={explore.eyebrow} title={explore.title} />
        <p className="mt-3 max-w-sm text-[15px] leading-snug text-[var(--text-dim)]">
          {selected ? (mobile ? explore.inspectHintTouch : explore.inspectHint) : mobile ? explore.hintTouch : explore.hint}
        </p>
        <p className="concept-note mt-3">{explore.disclaimer}</p>
      </div>

      <div className="explore-list" data-ui>
        <p className="sr-only" id="parts-list-label">
          {explore.listLabel}
        </p>
        <ol aria-labelledby="parts-list-label">
          {EXPLORE_PARTS.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                id={`part-btn-${p.id}`}
                className="part-button"
                aria-pressed={selected === p.id}
                onClick={() => (selected === p.id ? clearSelection() : selectPart(p.id))}
              >
                <span className="part-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="part-name">{p.title}</span>
                <StatusBadge status={p.status} compact />
              </button>
            </li>
          ))}
        </ol>
      </div>
      </div>

      {part && (
        <aside className="part-card" data-ui aria-labelledby="part-card-title">
          <div className="part-card-head">
            <StatusBadge status={part.status} />
            <h3 id="part-card-title" ref={cardTitle} tabIndex={-1} className="part-card-title">
              {part.title}
            </h3>
          </div>
          <dl className="part-facts">
            <div>
              <dt>{explore.labels.material}</dt>
              <dd>
                <Txt>{part.material}</Txt>
              </dd>
            </div>
            <div>
              <dt>{explore.labels.purpose}</dt>
              <dd>
                <Txt>{part.purpose}</Txt>
              </dd>
            </div>
            <div>
              <dt>{explore.labels.whyChosen}</dt>
              <dd>
                <Txt>{part.whyChosen}</Txt>
              </dd>
            </div>
          </dl>
          <p className="concept-note">{explore.disclaimer}</p>
        </aside>
      )}

      <div className="explore-controls" data-ui role="toolbar" aria-label="Управление разбором">
        {part && (
          <>
            <button type="button" className="ctrl ctrl-icon" aria-label={explore.controls.prevLabel} onClick={() => stepPart(-1)}>
              {explore.controls.prev}
            </button>
            <button type="button" className="ctrl ctrl-icon" aria-label={explore.controls.nextLabel} onClick={() => stepPart(1)}>
              {explore.controls.next}
            </button>
            <button type="button" className="ctrl" onClick={clearSelection}>
              {explore.controls.all}
            </button>
          </>
        )}
        <button type="button" className="ctrl ctrl-ghost" onClick={assembleShip}>
          {explore.controls.assemble}
        </button>
        {part && !mobile && <span className="esc-hint">{explore.controls.escHint}</span>}
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

/** Поверхность для вращения выбранной детали мышью или пальцем. На ней отключён жест прокрутки. */
function DragSurface() {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current > 0) inspect.zoom = clamp(inspect.zoom * (pinch.current / d), INSPECT_LIMITS.zoomMin, INSPECT_LIMITS.zoomMax);
      pinch.current = d;
      return;
    }
    // Медленное вращение с ограничением углов.
    inspect.yaw = clamp(inspect.yaw + (cur.x - prev.x) * 0.0045, -INSPECT_LIMITS.yaw, INSPECT_LIMITS.yaw);
    inspect.pitch = clamp(inspect.pitch + (cur.y - prev.y) * 0.003, -INSPECT_LIMITS.pitch, INSPECT_LIMITS.pitch);
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = 0;
  };
  const onWheel = (e: React.WheelEvent) => {
    inspect.zoom = clamp(inspect.zoom * Math.exp(e.deltaY * 0.0012), INSPECT_LIMITS.zoomMin, INSPECT_LIMITS.zoomMax);
  };

  return (
    <div
      className="drag-surface"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onWheel={onWheel}
      aria-hidden="true"
    />
  );
}
