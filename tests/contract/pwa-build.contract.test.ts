import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const GENERATOR_PATH = resolve('scripts/pwa/generate-service-worker.mjs');
const temporaryDirectories: string[] = [];

function createBuildFixture(): string {
  const directory = mkdtempSync(join(tmpdir(), 'ultimate-natives-pwa-'));
  temporaryDirectories.push(directory);
  const assets = join(directory, 'dist', 'assets');
  mkdirSync(assets, { recursive: true });
  writeFileSync(join(assets, 'app-AbCdEf12.js'), 'immutable js');
  writeFileSync(join(assets, 'index-BMFPf-44.css'), 'immutable css');
  writeFileSync(join(assets, 'practice-eW5q-SD4.js'), 'immutable route');
  writeFileSync(join(assets, 'app-AbCdEf12.js.map'), 'private source map');
  writeFileSync(join(assets, 'unhashed.js'), 'not immutable');
  return directory;
}

function generateWorker(directory: string): string {
  execFileSync(process.execPath, [GENERATOR_PATH], { cwd: directory });
  return readFileSync(join(directory, 'dist', 'service-worker.js'), 'utf8');
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('PWA build contract', () => {
  it('generates a deterministic worker from Vite-hashed assets only', () => {
    const directory = createBuildFixture();

    const first = generateWorker(directory);
    const second = generateWorker(directory);

    expect(second).toBe(first);
    expect(first).toContain('/assets/app-AbCdEf12.js');
    expect(first).toContain('/assets/index-BMFPf-44.css');
    expect(first).toContain('/assets/practice-eW5q-SD4.js');
    expect(first).not.toContain('.js.map');
    expect(first).not.toContain('/assets/unhashed.js');
  });

  it('keeps navigations network-first with a public offline fallback', () => {
    const worker = generateWorker(createBuildFixture());

    expect(worker).toContain("const OFFLINE_URL = '/offline.html'");
    expect(worker).toContain('return await fetch(request)');
    expect(worker).toContain('caches.match(OFFLINE_URL)');
    expect(worker).not.toContain('cache.put');
  });

  it('passes private, auth, API, cross-origin, and non-GET requests through', () => {
    const worker = generateWorker(createBuildFixture());

    expect(worker).toContain("const NEVER_CACHE_PREFIXES = ['/api/', '/auth/']");
    expect(worker).toContain("request.method !== 'GET'");
    expect(worker).toContain('url.origin !== self.location.origin');
    expect(worker).toContain('PRECACHE_PATHS.has(url.pathname)');
  });

  it('requires an explicit activation message for a waiting update', () => {
    const worker = generateWorker(createBuildFixture());

    expect(worker).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(worker).toContain('self.skipWaiting()');
    expect(worker).not.toContain("self.addEventListener('install', () => self.skipWaiting())");
  });
});
