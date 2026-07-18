import { APP_ICONS, type AppIcon } from '@/packages/icons';

import { BRAND_PALETTE } from './brand-palette.constants';

/**
 * Status tokens pair every status with a distinct icon and a colour for each
 * theme. The icon is what makes a status distinguishable — colour is never the
 * only signal (WCAG 1.4.1, "use of colour"). Consumers render the icon next to
 * a translated label; the colour is a reinforcement, not the message.
 *
 * `colorLight`/`colorDark` are proven to meet WCAG AA text contrast against the
 * light/dark surfaces in contrast.helper.test.ts.
 */
export interface BrandStatusToken {
  readonly icon: AppIcon;
  readonly colorLight: string;
  readonly colorDark: string;
}

export const BRAND_STATUS_TOKENS = {
  neutral: {
    icon: APP_ICONS.dot,
    colorLight: BRAND_PALETTE.slate,
    colorDark: BRAND_PALETTE.mist,
  },
  info: {
    icon: APP_ICONS.information,
    colorLight: BRAND_PALETTE.infoLight,
    colorDark: BRAND_PALETTE.infoDark,
  },
  success: {
    icon: APP_ICONS.checkmark,
    colorLight: BRAND_PALETTE.successLight,
    colorDark: BRAND_PALETTE.successDark,
  },
  warning: {
    icon: APP_ICONS.warning,
    colorLight: BRAND_PALETTE.warningLight,
    colorDark: BRAND_PALETTE.warningDark,
  },
  danger: {
    icon: APP_ICONS.alert,
    colorLight: BRAND_PALETTE.dangerLight,
    colorDark: BRAND_PALETTE.dangerDark,
  },
} as const satisfies Record<string, BrandStatusToken>;
