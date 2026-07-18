import { BRAND_CSS_HEADER, BRAND_CSS_INDENT } from './brand-css.constants';
import type { BrandTokens } from './brand-tokens.constants';
import {
  ION_COLOR_ROLE_NAMES,
  type BrandThemeTokens,
  type IonColorRole,
} from './brand-theme.constants';

/**
 * Deterministically builds the brand design tokens into the CSS custom
 * properties consumed at runtime. Output is committed as
 * brand-tokens.generated.css and its equality is enforced by the colocated
 * test, so this function — not a hand-edited stylesheet — is the source.
 *
 * Selectors use `:root:root` (specificity 0,2,0) and
 * `:root:root.ion-palette-dark` (0,3,0) so the brand always wins over Ionic's
 * default `:root` / `.ion-palette-dark` variables regardless of import order.
 */
function line(name: string, value: string): string {
  return `${BRAND_CSS_INDENT}${name}: ${value};`;
}

function renderConstantColorVars(palette: BrandTokens['palette']): readonly string[] {
  return [
    line('--un-brand-black', palette.black),
    line('--un-brand-gold', palette.gold),
    line('--un-brand-white', palette.white),
    line('--un-on-brand-gold', palette.black),
    line('--un-logo-safe-bg', palette.black),
  ];
}

function renderTypographyVars(typography: BrandTokens['typography']): readonly string[] {
  return [
    line('--ion-font-family', typography.fontFamilyBase),
    line('--un-font-family-base', typography.fontFamilyBase),
    line('--un-font-family-heading', typography.fontFamilyHeading),
    line('--un-font-family-mono', typography.fontFamilyMono),
    line('--un-font-weight-regular', typography.weightRegular),
    line('--un-font-weight-medium', typography.weightMedium),
    line('--un-font-weight-semibold', typography.weightSemibold),
    line('--un-font-weight-bold', typography.weightBold),
    line('--un-font-size-xs', typography.sizeXs),
    line('--un-font-size-sm', typography.sizeSm),
    line('--un-font-size-md', typography.sizeMd),
    line('--un-font-size-lg', typography.sizeLg),
    line('--un-font-size-xl', typography.sizeXl),
    line('--un-font-size-xxl', typography.sizeXxl),
    line('--un-line-height-tight', typography.lineHeightTight),
    line('--un-line-height-snug', typography.lineHeightSnug),
    line('--un-line-height-normal', typography.lineHeightNormal),
    line('--un-letter-spacing-tight', typography.letterSpacingTight),
    line('--un-letter-spacing-normal', typography.letterSpacingNormal),
    line('--un-letter-spacing-wide', typography.letterSpacingWide),
  ];
}

function renderScaleVars(tokens: BrandTokens): readonly string[] {
  const { spacing, radius, elevation, motion } = tokens;
  return [
    line('--un-space-xs', spacing.xs),
    line('--un-space-sm', spacing.sm),
    line('--un-space-md', spacing.md),
    line('--un-space-lg', spacing.lg),
    line('--un-space-xl', spacing.xl),
    line('--un-space-xxl', spacing.xxl),
    line('--un-radius-sm', radius.sm),
    line('--un-radius-md', radius.md),
    line('--un-radius-lg', radius.lg),
    line('--un-radius-xl', radius.xl),
    line('--un-radius-pill', radius.pill),
    line('--un-radius-circle', radius.circle),
    line('--un-elevation-none', elevation.none),
    line('--un-elevation-sm', elevation.sm),
    line('--un-elevation-md', elevation.md),
    line('--un-elevation-lg', elevation.lg),
    line('--un-motion-duration-instant', motion.durationInstant),
    line('--un-motion-duration-fast', motion.durationFast),
    line('--un-motion-duration-base', motion.durationBase),
    line('--un-motion-duration-slow', motion.durationSlow),
    line('--un-motion-easing-standard', motion.easingStandard),
    line('--un-motion-easing-emphasized', motion.easingEmphasized),
  ];
}

function renderRole(name: string, role: IonColorRole): readonly string[] {
  return [
    line(`--ion-color-${name}`, role.base),
    line(`--ion-color-${name}-rgb`, role.rgb),
    line(`--ion-color-${name}-contrast`, role.contrast),
    line(`--ion-color-${name}-contrast-rgb`, role.contrastRgb),
    line(`--ion-color-${name}-shade`, role.shade),
    line(`--ion-color-${name}-tint`, role.tint),
  ];
}

function renderThemeVars(theme: BrandThemeTokens): readonly string[] {
  const roleVars = ION_COLOR_ROLE_NAMES.flatMap((name) => renderRole(name, theme[name]));
  return [
    line('--ion-background-color', theme.background),
    line('--ion-background-color-rgb', theme.backgroundRgb),
    line('--ion-text-color', theme.text),
    line('--ion-text-color-rgb', theme.textRgb),
    line('--un-surface-elevated', theme.surfaceElevated),
    line('--un-border', theme.border),
    line('--un-muted', theme.muted),
    line('--un-focus-ring', theme.focusRing),
    ...roleVars,
  ];
}

export function buildBrandTokensCss(tokens: BrandTokens): string {
  const rootBody = [
    ...renderConstantColorVars(tokens.palette),
    ...renderTypographyVars(tokens.typography),
    ...renderScaleVars(tokens),
    ...renderThemeVars(tokens.themes.light),
  ];
  return [
    BRAND_CSS_HEADER,
    ':root:root {',
    ...rootBody,
    '}',
    '',
    ':root:root.ion-palette-dark {',
    ...renderThemeVars(tokens.themes.dark),
    '}',
    '',
  ].join('\n');
}
