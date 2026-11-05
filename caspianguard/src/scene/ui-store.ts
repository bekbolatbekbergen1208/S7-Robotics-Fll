"use client";

import { useSyncExternalStore } from "react";
import type { PartId } from "@/content/parts";

export interface UIState {
  /** Прогресс загрузки модели 0..1 (по байтам). */
  progress: number;
  loaded: boolean;
  failed: boolean;
  webgl: "unknown" | "yes" | "no";
  reducedMotion: boolean;
  mobile: boolean;
  /** Секция разбора закреплена на экране. */
  explorePinned: boolean;
  /** Детали можно выбирать кликом по модели. */
  exploreInteractive: boolean;
  selected: PartId | null;
  hovered: PartId | null;
  missingNodes: string[];
  /** Текст для скринридера о выбранной детали. */
  announcement: string;
}

let state: UIState = {
  progress: 0,
  loaded: false,
  failed: false,
  webgl: "unknown",
  reducedMotion: false,
  mobile: false,
  explorePinned: false,
  exploreInteractive: false,
  selected: null,
  hovered: null,
  missingNodes: [],
  announcement: "",
};

const listeners = new Set<() => void>();

export const ui = {
  get: () => state,
  set(patch: Partial<UIState>) {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof UIState;
      if (state[key] !== patch[key]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

const serverState = state;

export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    ui.subscribe,
    () => selector(ui.get()),
    () => selector(serverState),
  );
}
