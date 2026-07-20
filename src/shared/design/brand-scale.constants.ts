/**
 * Non-colour design primitives: typography, spacing, radius, control sizing,
 * layout, elevation, and motion. These are theme-independent and are emitted
 * once as `--un-*` custom properties by brand-css.helper.ts. Motion values are
 * additionally guarded by the global reduced-motion rule in
 * src/app/styles/app.css (WCAG 2.2).
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

/**
 * The 8pt spacing scale — 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Every gap,
 * padding, and margin in the app resolves to one of these steps; nothing is
 * allowed to invent an in-between value.
 */
export const BRAND_SPACING = {
  step1: '0.25rem',
  step2: '0.5rem',
  step3: '0.75rem',
  step4: '1rem',
  step6: '1.5rem',
  step8: '2rem',
  step12: '3rem',
  step16: '4rem',
} as const;

/** 8px on controls, 16px on cards, fully round on pills and avatars. */
export const BRAND_RADIUS = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  pill: '999px',
  circle: '50%',
} as const;

/** The three permitted control heights: 36 (compact), 44 (default), 52 (hero). */
export const BRAND_CONTROL = {
  heightSm: '2.25rem',
  heightMd: '2.75rem',
  heightLg: '3.25rem',
} as const;

/** Page frame: gutters, the centred reading measure, and the app chrome sizes. */
export const BRAND_LAYOUT = {
  gutterMobile: '1rem',
  gutterDesktop: '2rem',
  contentMax: '80rem',
  sidebarWidth: '17.5rem',
  appBarHeight: '4rem',
  tabBarHeight: '4rem',
} as const;

export const BRAND_ELEVATION = {
  none: 'none',
  sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
  md: '0 4px 12px rgba(15, 23, 42, 0.08)',
  lg: '0 12px 32px rgba(15, 23, 42, 0.14)',
} as const;

export const BRAND_MOTION = {
  durationInstant: '0ms',
  durationFast: '120ms',
  durationBase: '200ms',
  durationSlow: '320ms',
  easingStandard: 'cubic-bezier(0.2, 0, 0, 1)',
  easingEmphasized: 'cubic-bezier(0.3, 0, 0, 1)',
} as const;
