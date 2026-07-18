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

  it('declares installable 192px, 512px, and maskable PNG icons', () => {
    const manifest = buildWebManifest(BRAND_MANIFEST_IDENTITY, BRAND_TOKENS);
    expect(manifest.icons).toContainEqual({
      src: '/pwa-icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    });
    expect(manifest.icons).toContainEqual({
      src: '/pwa-icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    });
    expect(manifest.icons).toContainEqual({
      src: '/pwa-icon-maskable-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    });
  });
});
