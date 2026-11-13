/*
 * S7 Robotics: adds cross-origin isolation headers on the static host.
 * The 3D simulator (simulator/) pauses and stops Python through a
 * SharedArrayBuffer, which needs COOP + COEP on the simulator and on the page
 * that embeds it (game.html). Registered by simulator/theme/isolation.js.
 * Every other request passes straight through, untouched.
 *   simulator/  -> COEP require-corp (loads only its own files)
 *   game.html   -> COEP credentialless (keeps Google Fonts loading)
 */
const BASE = new URL('./', self.location).pathname

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

function modeFor(url) {
  if (url.origin !== self.location.origin) return null
  const p = url.pathname
  if (p.startsWith(BASE + 'simulator/') || p === BASE + 'simulator') return 'sim'
  if (p === BASE + 'game.html' || p === BASE + 'game') return 'page'
  return null
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  const mode = modeFor(new URL(req.url))
  if (!mode) return
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return

  event.respondWith(
    fetch(req).then((res) => {
      if (res.status === 0 || res.type === 'opaque' || res.type === 'opaqueredirect') return res
      const headers = new Headers(res.headers)
      headers.set('Cross-Origin-Opener-Policy', 'same-origin')
      headers.set('Cross-Origin-Embedder-Policy', mode === 'sim' ? 'require-corp' : 'credentialless')
      if (mode === 'sim') headers.set('Cross-Origin-Resource-Policy', 'same-origin')
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
    }),
  )
})
