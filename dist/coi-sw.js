/*
 * S7 Robotics service worker. Registered by simulator/theme/isolation.js.
 *
 * 1. Cross-origin isolation on the static host. The 3D simulator (simulator/)
 *    pauses and stops Python through a SharedArrayBuffer, which needs COOP + COEP
 *    on the simulator and on the page that embeds it (game.html):
 *      simulator/  -> COEP require-corp (loads only its own files)
 *      game.html   -> COEP credentialless (keeps Google Fonts loading)
 * 2. Caching of the simulator's files (~15 MB), so it opens instantly next time:
 *      simulator/assets/*  file names carry a content hash -> cache first
 *      other simulator files (pyodide, ldraw, theme)      -> cache, refresh in background
 *      pages (HTML)                                        -> always from the network
 * Every other request on the site passes straight through, untouched.
 * Bump CACHE when the caching rules change; old caches are deleted on activate.
 */
const CACHE = 's7-sim-v1'
const BASE = new URL('./', self.location).pathname

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('s7-sim-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  ),
)

function modeFor(url) {
  if (url.origin !== self.location.origin) return null
  const p = url.pathname
  if (p.startsWith(BASE + 'simulator/') || p === BASE + 'simulator') return 'sim'
  if (p === BASE + 'game.html' || p === BASE + 'game') return 'page'
  return null
}

function isolate(res, mode) {
  if (res.status === 0 || res.type === 'opaque' || res.type === 'opaqueredirect') return res
  const headers = new Headers(res.headers)
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Cross-Origin-Embedder-Policy', mode === 'sim' ? 'require-corp' : 'credentialless')
  if (mode === 'sim') headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}

async function fromNetwork(req, mode, cache) {
  const res = isolate(await fetch(req), mode)
  if (cache && res.status === 200) await cache.put(req, res.clone())
  return res
}

async function cached(req, mode, revalidate) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(req)
  if (!hit) return fromNetwork(req, mode, cache)
  if (revalidate) fromNetwork(req, mode, cache).catch(() => {})
  return hit
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  const mode = modeFor(url)
  if (!mode) return
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return

  const cacheable = mode === 'sim' && req.method === 'GET' && req.mode !== 'navigate' && !req.headers.has('range')
  if (!cacheable) {
    event.respondWith(fromNetwork(req, mode, null))
    return
  }
  const hashed = url.pathname.startsWith(BASE + 'simulator/assets/')
  event.respondWith(cached(req, mode, !hashed).catch(() => fromNetwork(req, mode, null)))
})
