/**
 * The confirmed public deployment origin. Kept in sync with index.html
 * <link rel="canonical">, public/robots.txt, and scripts/seo/generate-sitemap.mjs
 * (a build-time script outside src/, so it carries its own copy of this
 * literal rather than importing across that boundary).
 */
export const SITE_URL = 'https://natives-frontend-app.vercel.app';
