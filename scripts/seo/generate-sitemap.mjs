/**
 * Generates public/sitemap.xml for the public marketing routes so crawlers can
 * discover them. Run before `vite build` (wired into the `build` script) and the
 * output is committed so it is available even without a build.
 *
 * NOTE: SITE_URL is the canonical public origin (the confirmed Vercel
 * deployment) — keep this in sync with index.html <link rel="canonical">
 * and public/robots.txt.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://natives-frontend-app.vercel.app';

/**
 * Public, indexable marketing routes only. Auth utility routes
 * (login/forgot/reset) are intentionally excluded from the sitemap.
 * Extend this list as public pages ship.
 */
const PUBLIC_ROUTES = [
  { path: '/welcome', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
];

const OUTPUT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'public',
  'sitemap.xml',
);

function renderUrl(route) {
  const loc = `${SITE_URL}${route.path}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${route.priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function renderSitemap() {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PUBLIC_ROUTES.map(renderUrl),
    '</urlset>',
    '',
  ].join('\n');
}

writeFileSync(OUTPUT_PATH, renderSitemap(), 'utf8');
console.log(`SEO sitemap generated: ${OUTPUT_PATH} (${String(PUBLIC_ROUTES.length)} routes).`);
