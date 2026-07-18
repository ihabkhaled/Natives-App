import { describe, expect, it } from 'vitest';

import { BRAND_PALETTE } from './brand-palette.constants';
import { BRAND_STATUS_TOKENS } from './brand-status.constants';
import {
  BRAND_THEME_DARK,
  BRAND_THEME_LIGHT,
  ION_COLOR_ROLE_NAMES,
  type BrandThemeTokens,
} from './brand-theme.constants';
import {
  contrastRatio,
  hexToRgb,
  meetsContrast,
  relativeLuminance,
  WCAG_AA_LARGE,
  WCAG_AA_NORMAL,
} from './contrast.helper';

describe('contrast maths', () => {
  it('parses 6-digit hex with and without a leading hash', () => {
    expect(hexToRgb('#123456')).toEqual({ r: 18, g: 52, b: 86 });
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('expands 3-digit shorthand hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('rejects malformed hex input', () => {
    expect(() => hexToRgb('#12')).toThrow(/invalid hex/iu);
  });

  it('computes luminance at the extremes', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('computes the maximum 21:1 contrast for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  });

  it('reports pass/fail against a minimum, defaulting to AA normal', () => {
    expect(meetsContrast('#000000', '#FFFFFF')).toBe(true);
    expect(meetsContrast('#FFFFFF', '#FFFFFF')).toBe(false);
    expect(meetsContrast('#767676', '#FFFFFF', WCAG_AA_LARGE)).toBe(true);
  });
});

function aaResults(theme: BrandThemeTokens): number[] {
  return [
    contrastRatio(theme.text, theme.background),
    contrastRatio(theme.muted, theme.background),
    ...ION_COLOR_ROLE_NAMES.map((role) => contrastRatio(theme[role].contrast, theme[role].base)),
  ];
}

describe('brand palette accessibility', () => {
  it('keeps light-theme text and colour roles at WCAG AA', () => {
    for (const ratio of aaResults(BRAND_THEME_LIGHT)) {
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    }
    expect(
      contrastRatio(BRAND_THEME_LIGHT.focusRing, BRAND_THEME_LIGHT.background),
    ).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
  });

  it('keeps dark-theme text and colour roles at WCAG AA', () => {
    for (const ratio of aaResults(BRAND_THEME_DARK)) {
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    }
    expect(
      contrastRatio(BRAND_THEME_DARK.focusRing, BRAND_THEME_DARK.background),
    ).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
  });

  it('reads black text on the signature gold, but never gold as text on white', () => {
    expect(contrastRatio(BRAND_PALETTE.black, BRAND_PALETTE.gold)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL,
    );
    expect(contrastRatio(BRAND_PALETTE.gold, BRAND_PALETTE.white)).toBeLessThan(WCAG_AA_NORMAL);
  });

  it('keeps every status colour legible on its own surface', () => {
    for (const token of Object.values(BRAND_STATUS_TOKENS)) {
      expect(contrastRatio(token.colorLight, BRAND_PALETTE.white)).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL,
      );
      expect(contrastRatio(token.colorDark, BRAND_PALETTE.black)).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL,
      );
    }
  });
});
