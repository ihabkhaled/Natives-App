/**
 * Semantic theme tokens for the light and dark treatments. Each Ionic colour
 * role carries the full variable block Ionic expects (base, rgb, contrast,
 * contrast-rgb, shade, tint) so components render correct active/hover states.
 * brand-css.helper.ts turns these into the committed brand-tokens.generated.css.
 *
 * Role meanings in the "Field & Floodlight" system:
 * - `primary`   = electric turf lime with near-black ink. The one bold move.
 * - `secondary` = cool slate tonal. Supporting actions, never a dead grey.
 * - `tertiary`  = achievement gold. Badges, ranks, points — nothing else.
 * - `medium`    = muted slate for meta text and neutral chips.
 */
export interface IonColorRole {
  readonly base: string;
  readonly rgb: string;
  readonly contrast: string;
  readonly contrastRgb: string;
  readonly shade: string;
  readonly tint: string;
}

export interface BrandThemeTokens {
  readonly background: string;
  readonly backgroundRgb: string;
  readonly text: string;
  readonly textRgb: string;
  readonly surfaceElevated: string;
  readonly border: string;
  readonly muted: string;
  readonly focusRing: string;
  readonly primary: IonColorRole;
  readonly secondary: IonColorRole;
  readonly tertiary: IonColorRole;
  readonly success: IonColorRole;
  readonly warning: IonColorRole;
  readonly danger: IonColorRole;
  readonly medium: IonColorRole;
}

/** The list of Ionic colour roles rendered for each theme, in output order. */
export const ION_COLOR_ROLE_NAMES = [
  'primary',
  'secondary',
  'tertiary',
  'success',
  'warning',
  'danger',
  'medium',
] as const;

export const BRAND_THEME_LIGHT: BrandThemeTokens = {
  background: '#F8FAFC',
  backgroundRgb: '248, 250, 252',
  text: '#0F172A',
  textRgb: '15, 23, 42',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  muted: '#475569',
  focusRing: '#4D7C0F',
  primary: {
    base: '#84CC16',
    rgb: '132, 204, 22',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#65A30D',
    tint: '#A3E635',
  },
  secondary: {
    base: '#F1F5F9',
    rgb: '241, 245, 249',
    contrast: '#334155',
    contrastRgb: '51, 65, 85',
    shade: '#E2E8F0',
    tint: '#F8FAFC',
  },
  tertiary: {
    base: '#F5B93B',
    rgb: '245, 185, 59',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#A16207',
    tint: '#FBCB63',
  },
  success: {
    base: '#15803D',
    rgb: '21, 128, 61',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#166534',
    tint: '#22C55E',
  },
  warning: {
    base: '#B45309',
    rgb: '180, 83, 9',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#92400E',
    tint: '#F59E0B',
  },
  danger: {
    base: '#DC2626',
    rgb: '220, 38, 38',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#B91C1C',
    tint: '#EF4444',
  },
  medium: {
    base: '#475569',
    rgb: '71, 85, 105',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#334155',
    tint: '#64748B',
  },
};

export const BRAND_THEME_DARK: BrandThemeTokens = {
  background: '#0B1220',
  backgroundRgb: '11, 18, 32',
  text: '#E2E8F0',
  textRgb: '226, 232, 240',
  surfaceElevated: '#131C2E',
  border: '#1E293B',
  muted: '#94A3B8',
  focusRing: '#A3E635',
  primary: {
    base: '#A3E635',
    rgb: '163, 230, 53',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#84CC16',
    tint: '#BEF264',
  },
  secondary: {
    base: '#1E293B',
    rgb: '30, 41, 59',
    contrast: '#CBD5E1',
    contrastRgb: '203, 213, 225',
    shade: '#0F172A',
    tint: '#334155',
  },
  tertiary: {
    base: '#F5B93B',
    rgb: '245, 185, 59',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#D99F1F',
    tint: '#FBCB63',
  },
  success: {
    base: '#22C55E',
    rgb: '34, 197, 94',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#16A34A',
    tint: '#4ADE80',
  },
  warning: {
    base: '#F59E0B',
    rgb: '245, 158, 11',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#D97706',
    tint: '#FBBF24',
  },
  danger: {
    base: '#F87171',
    rgb: '248, 113, 113',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#EF4444',
    tint: '#FCA5A5',
  },
  medium: {
    base: '#94A3B8',
    rgb: '148, 163, 184',
    contrast: '#0B1220',
    contrastRgb: '11, 18, 32',
    shade: '#64748B',
    tint: '#CBD5E1',
  },
};
