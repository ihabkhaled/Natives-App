/**
 * Non-colour design primitives: typography, spacing, radius, elevation, and
 * motion. These are theme-independent and are emitted once as `--un-*` custom
 * properties by brand-css.helper.ts. Motion values are additionally guarded by
 * the global reduced-motion rule in src/app/styles/app.css (WCAG 2.2).
 */
export const BRAND_TYPOGRAPHY = {
  fontFamilyBase: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyHeading: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMono: "ui-monospace, SFMono-Regular, 'Cascadia Code', Menlo, Consolas, monospace",
  weightRegular: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
  sizeXs: '0.75rem',
  sizeSm: '0.875rem',
  sizeMd: '1rem',
  sizeLg: '1.25rem',
  sizeXl: '1.5rem',
  sizeXxl: '2rem',
  lineHeightTight: '1.2',
  lineHeightSnug: '1.35',
  lineHeightNormal: '1.5',
  letterSpacingTight: '-0.01em',
  letterSpacingNormal: '0',
  letterSpacingWide: '0.04em',
} as const;

export const BRAND_SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
} as const;

export const BRAND_RADIUS = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  pill: '999px',
  circle: '50%',
} as const;

export const BRAND_ELEVATION = {
  none: 'none',
  sm: '0 1px 2px rgba(11, 11, 11, 0.12)',
  md: '0 4px 12px rgba(11, 11, 11, 0.16)',
  lg: '0 12px 32px rgba(11, 11, 11, 0.24)',
} as const;

export const BRAND_MOTION = {
  durationInstant: '0ms',
  durationFast: '120ms',
  durationBase: '200ms',
  durationSlow: '320ms',
  easingStandard: 'cubic-bezier(0.2, 0, 0, 1)',
  easingEmphasized: 'cubic-bezier(0.3, 0, 0, 1)',
} as const;
