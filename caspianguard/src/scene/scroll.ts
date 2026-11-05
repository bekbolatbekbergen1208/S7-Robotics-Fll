import type Lenis from "lenis";

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};

/** Блокирует прокрутку на время режима детали; позиция скролла не меняется. */
export function lockScroll(lock: boolean) {
  document.documentElement.classList.toggle("scroll-locked", lock);
  if (!lenis) return;
  if (lock) lenis.stop();
  else lenis.start();
}

export function scrollToY(y: number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(y, { immediate, duration: 1.4, force: true });
  } else {
    window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  }
}
