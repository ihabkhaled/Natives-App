import process from 'node:process';

import { chromium } from '@playwright/test';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:4180';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`PWA browser verification failed: ${message}`);
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });

  const runtime = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const manifestLink = globalThis.document.querySelector('link[rel="manifest"]');
    const manifestUrl = manifestLink?.getAttribute('href') ?? '';
    const manifest = await fetch(manifestUrl).then((response) => response.json());
    const cachesByName = {};
    for (const cacheName of await globalThis.caches.keys()) {
      const cache = await globalThis.caches.open(cacheName);
      cachesByName[cacheName] = (await cache.keys()).map(
        (request) => new URL(request.url).pathname,
      );
    }
    return {
      controlled: navigator.serviceWorker.controller !== null,
      registrationScope: registration?.scope ?? null,
      manifest,
      cachesByName,
      bodyLength: globalThis.document.body.innerText.trim().length,
      hasErrorOverlay:
        globalThis.document.querySelector(
          '.vite-error-overlay, #webpack-dev-server-client-overlay',
        ) !== null,
    };
  });

  assert(runtime.controlled, 'the production page is not controlled by its worker');
  assert(runtime.registrationScope === `${baseUrl}/`, 'worker scope is not the origin root');
  assert(runtime.bodyLength > 0, 'the application rendered a blank page');
  assert(!runtime.hasErrorOverlay, 'a Vite error overlay is visible');
  assert(
    runtime.manifest.icons.some(
      (icon) => icon.src === '/pwa-icon-192.png' && icon.sizes === '192x192',
    ),
    'manifest has no 192px install icon',
  );
  assert(
    runtime.manifest.icons.some(
      (icon) =>
        icon.src === '/pwa-icon-maskable-512.png' &&
        icon.sizes === '512x512' &&
        icon.purpose === 'maskable',
    ),
    'manifest has no 512px maskable icon',
  );

  const cacheEntries = Object.entries(runtime.cachesByName);
  const staticCache = cacheEntries.find(([name]) => name.startsWith('ultimate-natives-static-'));
  const offlineCache = cacheEntries.find(([name]) => name === 'ultimate-natives-offline-v1');
  assert(staticCache !== undefined, 'immutable static cache was not installed');
  assert(offlineCache !== undefined, 'offline fallback cache was not installed');
  assert(
    staticCache[1].every((path) => path.startsWith('/assets/')),
    'the immutable cache contains a non-hashed public response',
  );
  assert(
    !cacheEntries
      .flatMap(([, paths]) => paths)
      .some((path) => path.startsWith('/api/') || path.startsWith('/auth/')),
    'an API or auth response entered a service-worker cache',
  );
  assert(
    offlineCache[1].length === 1 && offlineCache[1][0] === '/offline.html',
    'offline cache contains anything other than the public fallback',
  );

  await context.setOffline(true);
  await page.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' });
  assert(
    (await page.locator('h1').textContent()) === 'You’re offline',
    'offline navigation failed',
  );
  await context.setOffline(false);

  assert(consoleErrors.length === 0, `browser console errors: ${consoleErrors.join(' | ')}`);
  console.log(
    `PWA browser verification passed: controlled, installable, ${String(
      staticCache[1].length,
    )} immutable assets, offline navigation safe.`,
  );
} finally {
  await browser.close();
}
