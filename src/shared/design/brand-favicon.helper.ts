import type { BrandTokens } from './brand-tokens.constants';

/**
 * Renders the scalable brand favicon / maskable icon. This is a simplified,
 * reviewed derived mark (a gold flying disc on the brand-black field) — not the
 * full wordmark — chosen so it stays legible at 16px and survives maskable
 * cropping. The full wordmark ships untouched as public/brand-logo.png.
 *
 * The mark keeps a generous safe area: the disc spans roughly the central 60%
 * of the canvas, inside the 80% maskable safe zone. Output equality with the
 * committed public/favicon.svg is enforced by the colocated test.
 */
export function buildFaviconSvg(tokens: BrandTokens): string {
  const black = tokens.palette.black;
  const gold = tokens.palette.gold;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Ultimate Natives">',
    `  <rect width="512" height="512" rx="112" fill="${black}" />`,
    `  <ellipse cx="256" cy="256" rx="150" ry="96" fill="${gold}" />`,
    `  <ellipse cx="256" cy="256" rx="150" ry="96" fill="none" stroke="${black}" stroke-width="16" />`,
    `  <ellipse cx="256" cy="230" rx="94" ry="48" fill="none" stroke="${black}" stroke-width="10" opacity="0.35" />`,
    '</svg>',
    '',
  ].join('\n');
}
