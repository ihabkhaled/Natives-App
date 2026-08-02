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
  // `/` is the site's front door — the marketing landing page. `/welcome` is
  // the lightweight signed-out app entry kept alive for old deep links, so it
  // is deliberately NOT listed: two URLs claiming to be the home page compete
  // with each other.
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/ultimate', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/spirit', changefreq: 'monthly', priority: '0.7' },
  { path: '/team', changefreq: 'monthly', priority: '0.8' },
  { path: '/at-a-glance', changefreq: 'monthly', priority: '0.6' },
  { path: '/gallery', changefreq: 'monthly', priority: '0.5' },
  { path: '/location', changefreq: 'monthly', priority: '0.6' },
  { path: '/news', changefreq: 'weekly', priority: '0.8' },
  { path: '/tryouts', changefreq: 'weekly', priority: '0.9' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  // Public competitions showcase. Per-competition pages are intentionally
  // absent: their slugs come from the (not yet live) showcase endpoint, and a
  // sitemap must never list URLs a crawler would resolve to a 404.
  { path: '/results', changefreq: 'weekly', priority: '0.8' },
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
