import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildBrandTokensCss } from './brand-css.helper';
import { BRAND_TOKENS } from './brand-tokens.constants';

const GENERATED_PATH = resolve('src/shared/design/brand-tokens.generated.css');

describe('buildBrandTokensCss', () => {
  it('matches the committed generated stylesheet byte-for-byte', () => {
    const committed = readFileSync(GENERATED_PATH, 'utf8');
    expect(buildBrandTokensCss(BRAND_TOKENS)).toBe(committed);
  });

  it('scopes the light and dark blocks so the brand out-specifies Ionic', () => {
    const css = buildBrandTokensCss(BRAND_TOKENS);
    expect(css).toContain(':root:root {');
    expect(css).toContain(':root:root.ion-palette-dark {');
  });

  it('emits the light primary and dark primary Ionic variables', () => {
    const css = buildBrandTokensCss(BRAND_TOKENS);
    expect(css).toContain('--ion-color-primary: #84CC16;');
    expect(css).toContain('--ion-color-primary: #A3E635;');
  });

  it('emits the theme-independent brand and scale custom properties once', () => {
    const css = buildBrandTokensCss(BRAND_TOKENS);
    expect(css).toContain('--un-brand-gold: #F5B93B;');
    expect(css.match(/--un-brand-gold:/gu)).toHaveLength(1);
    expect(css).toContain('--un-brand-lime: #84CC16;');
    expect(css).toContain('--un-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);');
  });

  it('emits the 8pt spacing scale and the frame tokens exactly once', () => {
    const css = buildBrandTokensCss(BRAND_TOKENS);
    for (const step of ['1: 0.25rem', '2: 0.5rem', '4: 1rem', '6: 1.5rem', '16: 4rem']) {
      expect(css).toContain(`--un-space-${step};`);
    }
    expect(css).toContain('--un-control-md: 2.75rem;');
    expect(css).toContain('--un-content-max: 80rem;');
    expect(css.match(/--un-sidebar-width:/gu)).toHaveLength(1);
  });
});
