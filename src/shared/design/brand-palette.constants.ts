/**
 * Ultimate Natives raw brand palette — the single source of truth for every
 * committed and generated colour derivative (Ionic theme variables, CSS custom
 * properties, favicon, and PWA manifest). The brand identity is black, gold,
 * and white; every colour below is a reviewed, fixed hex value.
 *
 * Accessibility: gold (`gold`) is an accent for dark surfaces or as a filled
 * background with black text. It is never used as text on white. Contrast of
 * every text-bearing pair is proven in contrast.helper.test.ts.
 */
export const BRAND_PALETTE = {
  /** Brand black — the logo background and the dark theme surface. */
  black: '#0B0B0B',
  /** Slightly raised black for elevated dark surfaces (cards, sheets). */
  blackElevated: '#161616',
  /** Near-black used for body text on light surfaces. */
  ink: '#141414',
  /** Interactive near-black used as the light-theme primary. */
  inkPrimary: '#1A1A1A',
  /** Muted grey for secondary text on light surfaces. */
  slate: '#5B5B5B',
  /** Signature brand gold. */
  gold: '#D4AF37',
  /** Brighter gold for accents on dark surfaces. */
  goldBright: '#E8C158',
  /** Deep gold that stays legible as text/fill on white. */
  goldDeep: '#8A6D00',
  /** Pure white — the light theme surface and on-gold-free brand white. */
  white: '#FFFFFF',
  /** Warm off-white for text and elevated surfaces on dark backgrounds. */
  offWhite: '#F5F3EF',
  /** Hairline border on light surfaces. */
  cloud: '#E7E5E4',
  /** Muted warm grey for secondary text on dark surfaces. */
  mist: '#A8A29E',
  /** Hairline border on dark surfaces. */
  onyxBorder: '#2A2A2A',
  successLight: '#2E7D32',
  successDark: '#5FB865',
  warningLight: '#8A6D00',
  warningDark: '#E8C158',
  dangerLight: '#C62828',
  dangerDark: '#EF6C6C',
  infoLight: '#1565C0',
  infoDark: '#6FA8DC',
} as const;
