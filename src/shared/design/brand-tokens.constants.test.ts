import { describe, expect, it } from 'vitest';

import { BRAND_PALETTE } from './brand-palette.constants';
import { BRAND_STATUS_TOKENS } from './brand-status.constants';
import { BRAND_TOKENS } from './brand-tokens.constants';
import {
  BRAND_THEME_DARK,
  BRAND_THEME_LIGHT,
  ION_COLOR_ROLE_NAMES,
  type BrandThemeTokens,
} from './brand-theme.constants';

const HEX = /^#[0-9a-f]{6}$/iu;
const RGB = /^\d{1,3}, \d{1,3}, \d{1,3}$/u;

describe('BRAND_TOKENS', () => {
  it('aggregates every token group from its owned source', () => {
    expect(Object.keys(BRAND_TOKENS)).toEqual([
      'palette',
      'themes',
      'status',
      'typography',
      'spacing',
      'radius',
      'control',
      'layout',
      'elevation',
      'motion',
    ]);
    expect(BRAND_TOKENS.palette).toBe(BRAND_PALETTE);
    expect(BRAND_TOKENS.themes.light).toBe(BRAND_THEME_LIGHT);
    expect(BRAND_TOKENS.themes.dark).toBe(BRAND_THEME_DARK);
  });

  it('defines every palette colour as a 6-digit hex', () => {
    for (const value of Object.values(BRAND_PALETTE)) {
      expect(value).toMatch(HEX);
    }
  });

  it('anchors the identity on brand night, turf lime, and achievement gold', () => {
    expect(BRAND_PALETTE.black).toBe('#0B1220');
    expect(BRAND_PALETTE.lime).toBe('#84CC16');
    expect(BRAND_PALETTE.gold).toBe('#F5B93B');
    expect(BRAND_PALETTE.white).toBe('#FFFFFF');
  });

  it('keeps the surfaces on the cool slate ramp, never a warm cream', () => {
    expect(BRAND_TOKENS.themes.light.background).toBe('#F8FAFC');
    expect(BRAND_TOKENS.themes.light.surfaceElevated).toBe('#FFFFFF');
    expect(BRAND_TOKENS.themes.dark.background).toBe('#0B1220');
    expect(BRAND_TOKENS.themes.dark.surfaceElevated).toBe('#131C2E');
  });

  it('keeps the spacing scale on the 8pt steps', () => {
    expect(Object.values(BRAND_TOKENS.spacing)).toEqual([
      '0.25rem',
      '0.5rem',
      '0.75rem',
      '1rem',
      '1.5rem',
      '2rem',
      '3rem',
      '4rem',
    ]);
  });

  it('offers exactly three control heights and card/control radii', () => {
    expect(Object.values(BRAND_TOKENS.control)).toEqual(['2.25rem', '2.75rem', '3.25rem']);
    expect(BRAND_TOKENS.radius.md).toBe('0.5rem');
    expect(BRAND_TOKENS.radius.xl).toBe('1rem');
    expect(BRAND_TOKENS.radius.pill).toBe('999px');
  });

  it('frames the page with mobile/desktop gutters and a centred measure', () => {
    expect(BRAND_TOKENS.layout.gutterMobile).toBe('1rem');
    expect(BRAND_TOKENS.layout.gutterDesktop).toBe('2rem');
    expect(BRAND_TOKENS.layout.contentMax).toBe('80rem');
  });
});

function collectHexValues(theme: BrandThemeTokens): string[] {
  const hexes = [theme.background, theme.text, theme.surfaceElevated, theme.border];
  for (const name of ION_COLOR_ROLE_NAMES) {
    const role = theme[name];
    hexes.push(role.base, role.contrast, role.shade, role.tint);
  }
  return hexes;
}

function collectRgbValues(theme: BrandThemeTokens): string[] {
  const rgbs = [theme.backgroundRgb, theme.textRgb];
  for (const name of ION_COLOR_ROLE_NAMES) {
    rgbs.push(theme[name].rgb, theme[name].contrastRgb);
  }
  return rgbs;
}

describe('brand themes', () => {
  it('gives the light theme a complete Ionic colour block', () => {
    for (const hex of collectHexValues(BRAND_THEME_LIGHT)) {
      expect(hex).toMatch(HEX);
    }
    for (const rgb of collectRgbValues(BRAND_THEME_LIGHT)) {
      expect(rgb).toMatch(RGB);
    }
  });

  it('gives the dark theme a complete Ionic colour block', () => {
    for (const hex of collectHexValues(BRAND_THEME_DARK)) {
      expect(hex).toMatch(HEX);
    }
    for (const rgb of collectRgbValues(BRAND_THEME_DARK)) {
      expect(rgb).toMatch(RGB);
    }
  });

  it('keeps turf lime as the primary in both themes, always with ink text', () => {
    expect(BRAND_THEME_LIGHT.primary.base).toBe(BRAND_PALETTE.lime);
    expect(BRAND_THEME_DARK.primary.base).toBe(BRAND_PALETTE.limeBright);
    expect(BRAND_THEME_LIGHT.primary.contrast).toBe(BRAND_PALETTE.black);
    expect(BRAND_THEME_DARK.primary.contrast).toBe(BRAND_PALETTE.black);
  });

  it('reserves the gold tertiary role for achievements in both themes', () => {
    expect(BRAND_THEME_LIGHT.tertiary.base).toBe(BRAND_PALETTE.gold);
    expect(BRAND_THEME_DARK.tertiary.base).toBe(BRAND_PALETTE.gold);
  });
});

describe('BRAND_STATUS_TOKENS', () => {
  it('covers the five status intents', () => {
    expect(Object.keys(BRAND_STATUS_TOKENS)).toEqual([
      'neutral',
      'info',
      'success',
      'warning',
      'danger',
    ]);
  });

  it('gives each status a distinct icon so colour is never the only signal', () => {
    const icons = Object.values(BRAND_STATUS_TOKENS).map((token) => token.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it('provides a light and dark colour for every status', () => {
    for (const token of Object.values(BRAND_STATUS_TOKENS)) {
      expect(token.colorLight).toMatch(HEX);
      expect(token.colorDark).toMatch(HEX);
    }
  });
});
