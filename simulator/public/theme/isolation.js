/*
 * S7 Robotics: cross-origin isolation on a static host.
 * Pause / Stop of a running Python program use a SharedArrayBuffer, which the
 * browser only allows on pages served with COOP/COEP headers. The site's static
 * host can't set headers, so the service worker coi-sw.js (site root) adds them
 * to game.html and simulator/. This script registers it and reloads the page
 * once when the worker takes over. Without it the simulator still works:
 * Stop then restarts the simulator instead of pausing.
 *
 * Usage: <script src=".../isolation.js"></script> inside simulator/ (finds
 * ../../coi-sw.js), or with data-sw="coi-sw.js" (relative to the page).
 */
;(function () {
  var KEY = 's7-coi-reloaded'
  if (window.crossOriginIsolated) {
    try { sessionStorage.removeItem(KEY) } catch (e) {}
    return
  }
  if (!window.isSecureContext || !('serviceWorker' in navigator)) return

  var script = document.currentScript
  var custom = script && script.getAttribute('data-sw')
  var swUrl = custom ? new URL(custom, location.href) : new URL('../../coi-sw.js', script ? script.src : location.href)

  function reloadOnce() {
    try {
      if (sessionStorage.getItem(KEY)) return
      sessionStorage.setItem(KEY, '1')
    } catch (e) {
      return
    }
    location.reload()
  }

  navigator.serviceWorker
    .register(swUrl)
    .then(function (reg) {
      // Already controlled but still not isolated (e.g. embedded in a page that isn't): nothing to do.
      if (navigator.serviceWorker.controller) return
      navigator.serviceWorker.addEventListener('controllerchange', reloadOnce)
      // Worker already active (hard reload bypassed it): reload to come back under it.
      if (reg.active) reloadOnce()
    })
    .catch(function () {})
})()
