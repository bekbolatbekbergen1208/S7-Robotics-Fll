import { explore, statusLabels } from "@/content/content";
import { EXPLORE_PARTS, getPart, type PartId } from "@/content/parts";
import { inspect, scrollMarks } from "./state";
import { ui } from "./ui-store";
import { lockScroll, scrollToY } from "./scroll";

function resetInspect() {
  inspect.yaw = 0;
  inspect.pitch = 0;
  inspect.zoom = 1;
}

export function selectPart(id: PartId) {
  const wasSelected = ui.get().selected;
  if (wasSelected === id) return;
  resetInspect();
  const part = getPart(id);
  ui.set({ selected: id, hovered: null, announcement: explore.announce(part.title, statusLabels[part.status]) });
  if (!wasSelected) lockScroll(true);
}

export function clearSelection() {
  if (!ui.get().selected) return;
  resetInspect();
  ui.set({ selected: null, announcement: explore.announceAll });
  lockScroll(false);
}

export function stepPart(dir: 1 | -1) {
  const current = ui.get().selected;
  const ids = EXPLORE_PARTS.map((p) => p.id);
  const i = current ? ids.indexOf(current) : dir === 1 ? -1 : 0;
  selectPart(ids[(i + dir + ids.length) % ids.length]);
}

/** «Собрать корабль»: выходим из режима детали и прокручиваем к началу разбора. */
export function assembleShip() {
  clearSelection();
  scrollToY(scrollMarks.exploreStart, ui.get().reducedMotion);
}
