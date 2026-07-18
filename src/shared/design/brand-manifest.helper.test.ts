import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { BRAND_MANIFEST_IDENTITY } from './brand-manifest.constants';
import { buildWebManifest } from './brand-manifest.helper';
import { BRAND_TOKENS } from './brand-tokens.constants';

const MANIFEST_PATH = resolve('public/manifest.webmanifest');

describe('buildWebManifest', () => {
  it('matches the committed public/manifest.webmanifest', () => {
    const committed = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as unknown;
    expect(buildWebManifest(BRAND_MANIFEST_IDENTITY, BRAND_TOKENS)).toEqual(committed);
  });

  it('uses the brand black for the chrome and background colours', () => {
    const manifest = buildWebManifest(BRAND_MANIFEST_IDENTITY, BRAND_TOKENS);
    expect(manifest.theme_color).toBe(BRAND_TOKENS.palette.black);
    expect(manifest.background_color).toBe(BRAND_TOKENS.palette.black);
    expect(manifest.name).toBe('Ultimate Natives');
    expect(manifest.short_name).toBe('Natives');
  });

  it('references only committed safe source art, including a maskable icon', () => {
    const manifest = buildWebManifest(BRAND_MANIFEST_IDENTITY, BRAND_TOKENS);
    const sources = manifest.icons.map((icon) => icon.src);
    expect(new Set(sources)).toEqual(new Set(['/favicon.svg', '/brand-logo.png']));
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
  });
});
