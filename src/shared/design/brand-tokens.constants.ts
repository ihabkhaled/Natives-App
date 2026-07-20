import { BRAND_PALETTE } from './brand-palette.constants';
import {
  BRAND_CONTROL,
  BRAND_ELEVATION,
  BRAND_LAYOUT,
  BRAND_MOTION,
  BRAND_RADIUS,
  BRAND_SPACING,
  BRAND_TYPOGRAPHY,
} from './brand-scale.constants';
import { BRAND_STATUS_TOKENS } from './brand-status.constants';
import { BRAND_THEME_DARK, BRAND_THEME_LIGHT } from './brand-theme.constants';

/**
 * The aggregate Ultimate Natives design-token object. This is the public,
 * owned source of truth; every generated derivative (CSS variables, favicon,
 * web manifest) is produced from it and verified for determinism by the
 * colocated helper tests.
 */
export const BRAND_TOKENS = {
  palette: BRAND_PALETTE,
  themes: {
    light: BRAND_THEME_LIGHT,
    dark: BRAND_THEME_DARK,
  },
  status: BRAND_STATUS_TOKENS,
  typography: BRAND_TYPOGRAPHY,
  spacing: BRAND_SPACING,
  radius: BRAND_RADIUS,
  control: BRAND_CONTROL,
  layout: BRAND_LAYOUT,
  elevation: BRAND_ELEVATION,
  motion: BRAND_MOTION,
} as const;

export type BrandTokens = typeof BRAND_TOKENS;
