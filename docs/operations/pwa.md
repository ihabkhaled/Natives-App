# PWA runtime and cache policy

The production web build is installable and has a deliberately narrow service-worker boundary.
Development and mock mode do not register this worker, because MSW owns its own development worker.
Capacitor Android/iOS builds also skip registration; native lifecycle remains behind the existing
Capacitor owners.

## Build and install surface

`npm run build` runs Vite first, then
[`generate-service-worker.mjs`](../../scripts/pwa/generate-service-worker.mjs). The generator reads
`dist/assets`, accepts only filenames with Vite content hashes, and emits `dist/service-worker.js`.
The manifest declares real 192px and 512px PNG derivatives of the checksum-pinned brand source plus
a padded 512px maskable derivative. Regenerate them with `npm run brand:generate`.

Run `npm run pwa:verify` after a build. It checks icon files and dimensions, the maskable
declaration, the offline document, every immutable precache entry, and the absence of unhashed
documents from that cache class.

With `npm run preview -- --host 127.0.0.1 --port 4180` running, execute
`node scripts/pwa/verify-pwa-browser.mjs`. The pinned Chromium check proves the page is controlled,
inspects the real browser caches, validates the manifest, and drives an offline deep navigation.

## Cache classes

| Cache                             | May contain                                           | Must never contain                                                    |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| `ultimate-natives-static-<build>` | Vite-hashed JS, CSS, fonts, and imported public media | HTML navigations, API/auth responses, source maps, manifest, raw logo |
| `ultimate-natives-offline-v1`     | Only `offline.html`                                   | Session state, API payloads, private pages, tokens, queued operations |

Navigations are always network-first and are never written to a worker cache. When the network
fails, the worker returns the public offline document. Cross-origin requests, non-GET requests,
`/api/*`, `/auth/*`, and every URL outside the generated immutable allowlist pass through without a
worker response or cache write. Offline read data for approved product workflows belongs in its
future scoped storage owner, never in these broad web caches.

## Updates and state preservation

The platform facade detects an already waiting worker and newly installed updates. Returning to a
visible PWA also asks the registration to check again. A localized persistent toast offers an
explicit restart action; the current worker stays active until the user chooses it.

Activation first awaits the app-provided preservation gate. A `false` result or thrown error leaves
the waiting worker untouched. The app then reloads only after `controllerchange`, proving the new
worker controls the page. Today no approved offline-write queue is implemented, so the gate
explicitly resolves safe. Before attendance or scorekeeping queues ship, their owners must compose
real flush/block checks into this callback; they must not put queue payloads in a service-worker
cache.

Every `updatefound`, worker `statechange`, `controllerchange`, and document `visibilitychange`
listener is removed when the lifecycle provider unmounts. Registration failures are logged without
raw browser errors and never prevent the app from starting.

## Support recovery

If installation or updates fail, verify HTTPS (localhost is the development exception), confirm
`service-worker.js` is served from the origin root with JavaScript content type, then clear only
this origin's site data through browser settings. Never add API responses to the immutable cache as
a recovery shortcut.
