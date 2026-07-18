import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildFaviconSvg } from './brand-favicon.helper';
import { BRAND_TOKENS } from './brand-tokens.constants';

const FAVICON_PATH = resolve('public/favicon.svg');

describe('buildFaviconSvg', () => {
  it('matches the committed public/favicon.svg', () => {
    const committed = readFileSync(FAVICON_PATH, 'utf8');
    expect(buildFaviconSvg(BRAND_TOKENS)).toBe(committed);
  });

  it('draws the gold mark on the brand-black field with an accessible label', () => {
    const svg = buildFaviconSvg(BRAND_TOKENS);
    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg).toContain('aria-label="Ultimate Natives"');
    expect(svg).toContain(`fill="${BRAND_TOKENS.palette.black}"`);
    expect(svg).toContain(`fill="${BRAND_TOKENS.palette.gold}"`);
  });
});
