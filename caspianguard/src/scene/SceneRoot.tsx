"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { annotations, fallback, loader, solution, values } from "@/content/content";
import { MOBILE_QUERY } from "./config";
import { annotationEls } from "./annotations";
import { ui, useUI } from "./ui-store";

// 3D грузится лениво и только в браузере.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

export function SceneRoot() {
  const webgl = useUI((s) => s.webgl);
  const loaded = useUI((s) => s.loaded);
  const failed = useUI((s) => s.failed);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => ui.set({ mobile: mq.matches, reducedMotion: rm.matches });
    sync();
    ui.set({ webgl: detectWebGL() ? "yes" : "no" });
    mq.addEventListener("change", sync);
    rm.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      rm.removeEventListener("change", sync);
    };
  }, []);

  const show3D = webgl === "yes" && !failed;

  return (
    <>
      {/* Статичное изображение: без WebGL, без JS и при ошибке загрузки модели. */}
      <div
        className="static-fallback fixed inset-0 z-0"
        data-hidden={show3D && loaded ? "true" : "false"}
        aria-hidden={show3D && loaded}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/caspianguard/images/caspianguard-concept.jpg" alt={fallback.imageAlt} className="h-full w-full object-cover" />
        {webgl === "no" && <p className="fallback-note">{fallback.noWebgl}</p>}
      </div>

      {show3D && (
        <div className="scene-layer">
          <SceneCanvas />
        </div>
      )}

      <AnnotationLayer />
      <Loader />
    </>
  );
}

function Loader() {
  const webgl = useUI((s) => s.webgl);
  const progress = useUI((s) => s.progress);
  const loaded = useUI((s) => s.loaded);
  const failed = useUI((s) => s.failed);
  const hidden = webgl === "no" || loaded || failed;
  const pct = Math.round(progress * 100);

  return (
    <div className="loader" data-hidden={hidden ? "true" : "false"} role="status" aria-live="polite" aria-hidden={hidden}>
      <div className="loader-inner">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--teal-soft)]">{loader.title}</p>
        <p className="loader-pct font-display" aria-label={`${pct}%`}>
          {pct}
          <span>%</span>
        </p>
        <div
          className="loader-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={loader.title}
        >
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      {failed && <p className="mt-6 text-sm text-[var(--amber)]">{loader.failed}</p>}
    </div>
  );
}

/** Подписи, привязанные к 3D-точкам. Позиции задаёт AnnotationProjector. */
function AnnotationLayer() {
  const register = (id: string) => (el: HTMLElement | null) => {
    if (el) annotationEls.set(id, el);
    else annotationEls.delete(id);
  };
  const labels = [
    ...solution.steps.map((s, i) => ({ id: s.id, n: `0${i + 1}`, title: s.label, text: s.text })),
    { id: "solar", n: "→", title: annotations.solar, text: "" },
    ...values.items.map((v, i) => ({ id: `value-${i}`, n: `0${i + 1}`, title: v.name, text: "" })),
  ];
  return (
    <div className="annotation-layer" aria-hidden="true">
      {labels.map((l) => (
        <div key={l.id} ref={register(l.id)} className="annotation" style={{ opacity: 0, visibility: "hidden" }}>
          <span className="annotation-dot" />
          <span className="annotation-line" />
          <span className="annotation-card">
            <span className="annotation-n">{l.n}</span>
            <span className="annotation-title">{l.title}</span>
            {l.text && <span className="annotation-text">{l.text}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
