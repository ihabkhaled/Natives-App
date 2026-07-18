/**
 * Semantic theme tokens for the light and dark treatments. Each Ionic colour
 * role carries the full variable block Ionic expects (base, rgb, contrast,
 * contrast-rgb, shade, tint) so components render correct active/hover states.
 * brand-css.helper.ts turns these into the committed brand-tokens.generated.css.
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
  background: '#FFFFFF',
  backgroundRgb: '255, 255, 255',
  text: '#141414',
  textRgb: '20, 20, 20',
  surfaceElevated: '#F5F3EF',
  border: '#E7E5E4',
  muted: '#5B5B5B',
  focusRing: '#8A6D00',
  primary: {
    base: '#1A1A1A',
    rgb: '26, 26, 26',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#000000',
    tint: '#333333',
  },
  secondary: {
    base: '#8A6D00',
    rgb: '138, 109, 0',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#6E5700',
    tint: '#9B7E1A',
  },
  tertiary: {
    base: '#D4AF37',
    rgb: '212, 175, 55',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#B8942A',
    tint: '#DDBB55',
  },
  success: {
    base: '#2E7D32',
    rgb: '46, 125, 50',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#286E2C',
    tint: '#438A47',
  },
  warning: {
    base: '#8A6D00',
    rgb: '138, 109, 0',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#6E5700',
    tint: '#9B7E1A',
  },
  danger: {
    base: '#C62828',
    rgb: '198, 40, 40',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#AE2323',
    tint: '#CC3E3E',
  },
  medium: {
    base: '#5B5B5B',
    rgb: '91, 91, 91',
    contrast: '#FFFFFF',
    contrastRgb: '255, 255, 255',
    shade: '#505050',
    tint: '#6B6B6B',
  },
};

export const BRAND_THEME_DARK: BrandThemeTokens = {
  background: '#0B0B0B',
  backgroundRgb: '11, 11, 11',
  text: '#F5F3EF',
  textRgb: '245, 243, 239',
  surfaceElevated: '#161616',
  border: '#2A2A2A',
  muted: '#A8A29E',
  focusRing: '#D4AF37',
  primary: {
    base: '#D4AF37',
    rgb: '212, 175, 55',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#B8942A',
    tint: '#DDBB55',
  },
  secondary: {
    base: '#E8C158',
    rgb: '232, 193, 88',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#CBA84C',
    tint: '#EDCB70',
  },
  tertiary: {
    base: '#D4AF37',
    rgb: '212, 175, 55',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#B8942A',
    tint: '#DDBB55',
  },
  success: {
    base: '#5FB865',
    rgb: '95, 184, 101',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#54A259',
    tint: '#6FBF74',
  },
  warning: {
    base: '#E8C158',
    rgb: '232, 193, 88',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#CBA84C',
    tint: '#EDCB70',
  },
  danger: {
    base: '#EF6C6C',
    rgb: '239, 108, 108',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#D25F5F',
    tint: '#F17B7B',
  },
  medium: {
    base: '#A8A29E',
    rgb: '168, 162, 158',
    contrast: '#0B0B0B',
    contrastRgb: '11, 11, 11',
    shade: '#948F8B',
    tint: '#B6B1AD',
  },
};
