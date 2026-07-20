/**
 * Ultimate Natives raw brand palette — "Field & Floodlight". Single source of
 * truth for every committed and generated colour derivative (Ionic theme
 * variables, CSS custom properties, favicon, and PWA manifest).
 *
 * The direction is taken from the sport itself: cool floodlit slate surfaces,
 * one electric turf-lime action colour, and a gold that is reserved for
 * meaning. Every colour below is a reviewed, fixed hex value.
 *
 * Accessibility rules encoded here and proven in contrast.helper.test.ts:
 * - `lime` and `limeBright` always carry near-black `ink` text, never white.
 * - `gold` is a fill (with ink text) or a dark-surface accent; on light
 *   surfaces its legible text form is `goldDeep`.
 * - Every status colour has a light-surface and a dark-surface variant.
 */
export const BRAND_PALETTE = {
  /** Brand night — the dark page canvas and the ink used on every bright fill. */
  black: '#0B1220',
  /** Raised night surface for dark-theme cards and sheets. */
  blackElevated: '#131C2E',
  /** Hairline border on dark surfaces. */
  onyxBorder: '#1E293B',
  /** Near-black slate used for body text on light surfaces. */
  ink: '#0F172A',
  /** Interactive slate used for tonal secondary text. */
  inkPrimary: '#334155',
  /** Muted slate for secondary text on light surfaces. */
  slate: '#475569',
  /** Muted slate for secondary text on dark surfaces. */
  mist: '#94A3B8',
  /** Electric turf lime — the signature primary action colour. */
  lime: '#84CC16',
  /** Brighter turf lime — the dark-theme primary and gradient start. */
  limeBright: '#A3E635',
  /** Deep turf lime — the gradient end and pressed state. */
  limeDeep: '#65A30D',
  /** Darkest turf lime that stays legible as text/ring on light surfaces. */
  limeInk: '#4D7C0F',
  /** Signature achievement gold. Never a background wash, never a plain button. */
  gold: '#F5B93B',
  /** Brighter gold for accents on dark surfaces. */
  goldBright: '#FBCB63',
  /** Deep gold that stays legible as text on light surfaces. */
  goldDeep: '#A16207',
  /** Pure white — the light-theme card surface. */
  white: '#FFFFFF',
  /** Cool page canvas for the light theme. */
  offWhite: '#F8FAFC',
  /** Tonal slate surface for secondary controls on light surfaces. */
  cloudTonal: '#F1F5F9',
  /** Hairline border on light surfaces. */
  cloud: '#E2E8F0',
  successLight: '#15803D',
  successDark: '#22C55E',
  warningLight: '#B45309',
  warningDark: '#F59E0B',
  dangerLight: '#DC2626',
  dangerDark: '#F87171',
  infoLight: '#0369A1',
  infoDark: '#38BDF8',
} as const;
