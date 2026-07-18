import { existsSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import process from 'node:process';

const DIST_DIRECTORY = 'dist';
const MANIFEST_PATH = join(DIST_DIRECTORY, 'manifest.webmanifest');
const SERVICE_WORKER_PATH = join(DIST_DIRECTORY, 'service-worker.js');
const REQUIRED_FILES = [
  join(DIST_DIRECTORY, 'offline.html'),
  join(DIST_DIRECTORY, 'pwa-icon-192.png'),
  join(DIST_DIRECTORY, 'pwa-icon-512.png'),
  join(DIST_DIRECTORY, 'pwa-icon-maskable-512.png'),
  MANIFEST_PATH,
  SERVICE_WORKER_PATH,
];

function fail(message) {
  console.error(`PWA verification failed: ${message}`);
  process.exit(1);
}

function readPngDimensions(path) {
  const bytes = readFileSync(path);
  const pngSignature = '89504e470d0a1a0a';
  if (bytes.subarray(0, 8).toString('hex') !== pngSignature) {
    fail(`${path} is not a PNG`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function precacheUrlsFrom(worker) {
  const marker = 'const PRECACHE_URLS = ';
  const start = worker.indexOf(marker);
  const end = worker.indexOf(';\nconst STATIC_CACHE', start);
  if (start < 0 || end < 0) {
    fail('generated worker has no readable immutable precache list');
  }
  return JSON.parse(worker.slice(start + marker.length, end));
}

function isHashedAsset(url) {
  if (!url.startsWith('/assets/')) {
    return false;
  }
  const extension = extname(url);
  const stem = basename(url, extension);
  const hash = stem.slice(-8);
  const hasEncodedCharacter =
    hash !== hash.toLowerCase() ||
    [...hash].some((character) => character >= '0' && character <= '9') ||
    hash.includes('_') ||
    hash.includes('-');
  return (
    stem.length > 8 &&
    [...hash].every((character) => /[\w-]/u.test(character)) &&
    hasEncodedCharacter
  );
}

for (const path of REQUIRED_FILES) {
  if (!existsSync(path)) {
    fail(`missing ${path}; run npm run build and npm run brand:generate`);
  }
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const requiredIcons = new Map([
  ['/pwa-icon-192.png', 192],
  ['/pwa-icon-512.png', 512],
  ['/pwa-icon-maskable-512.png', 512],
]);
for (const [source, expectedSize] of requiredIcons) {
  const icon = manifest.icons?.find((candidate) => candidate.src === source);
  if (icon?.type !== 'image/png') {
    fail(`manifest is missing PNG icon ${source}`);
  }
  const dimensions = readPngDimensions(join(DIST_DIRECTORY, source.slice(1)));
  if (dimensions.width !== expectedSize || dimensions.height !== expectedSize) {
    fail(`${source} must be ${String(expectedSize)}x${String(expectedSize)}`);
  }
}
const maskable = manifest.icons?.find((icon) => icon.src === '/pwa-icon-maskable-512.png');
if (maskable?.purpose !== 'maskable') {
  fail('512px safe-area icon is not declared maskable');
}

const worker = readFileSync(SERVICE_WORKER_PATH, 'utf8');
const precacheUrls = precacheUrlsFrom(worker);
if (!Array.isArray(precacheUrls) || precacheUrls.length === 0) {
  fail('immutable precache list is empty');
}
for (const url of precacheUrls) {
  if (typeof url !== 'string' || !isHashedAsset(url)) {
    fail(`non-hashed asset entered immutable precache: ${String(url)}`);
  }
  if (!existsSync(join(DIST_DIRECTORY, url.slice(1)))) {
    fail(`precache entry does not exist: ${url}`);
  }
}
for (const forbidden of ['/index.html', '/manifest.webmanifest', '/offline.html', '/api/']) {
  if (precacheUrls.includes(forbidden)) {
    fail(`forbidden response entered immutable precache: ${forbidden}`);
  }
}
console.log(
  `PWA verification passed: manifest icons valid; ${String(precacheUrls.length)} hashed assets only; offline fallback present.`,
);
