import { APP_ICONS } from '@/packages/icons';
import { SOCIAL_LINKS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

/** Social key → translated label key, kept explicit rather than a dynamic lookup. */
export const SOCIAL_LABEL_I18N_KEYS = {
  facebook: I18N_KEYS.publicFooter.facebookLabel,
  instagram: I18N_KEYS.publicFooter.instagramLabel,
  tiktok: I18N_KEYS.publicFooter.tiktokLabel,
} as const;

/** Social key → icon, kept explicit rather than a dynamic lookup. */
const SOCIAL_ICONS = {
  facebook: APP_ICONS.logoFacebook,
  instagram: APP_ICONS.logoInstagram,
  tiktok: APP_ICONS.logoTiktok,
} as const;

/**
 * The footer's social row: the shared `SOCIAL_LINKS` declaration home
 * (rule 08/20), decorated with the app-layer icon each platform uses.
 */
export const PUBLIC_SOCIAL_LINKS = SOCIAL_LINKS.map((social) => ({
  key: social.key,
  href: social.href,
  icon: SOCIAL_ICONS[social.key],
}));
