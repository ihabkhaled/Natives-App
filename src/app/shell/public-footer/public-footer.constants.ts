import { APP_ICONS } from '@/packages/icons';
import { I18N_KEYS } from '@/shared/i18n';

/** Social key → translated label key, kept explicit rather than a dynamic lookup. */
export const SOCIAL_LABEL_I18N_KEYS = {
  facebook: I18N_KEYS.publicFooter.facebookLabel,
  instagram: I18N_KEYS.publicFooter.instagramLabel,
  tiktok: I18N_KEYS.publicFooter.tiktokLabel,
} as const;

/**
 * The real, user-confirmed Ultimate Natives social profiles. Kept as one
 * declaration home (rule 08/20) rather than scattered literals.
 */
export const PUBLIC_SOCIAL_LINKS = [
  {
    key: 'facebook',
    href: 'https://www.facebook.com/ultimatenatives',
    icon: APP_ICONS.logoFacebook,
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/ultimatenatives',
    icon: APP_ICONS.logoInstagram,
  },
  {
    key: 'tiktok',
    href: 'https://www.tiktok.com/@ultimate.natives',
    icon: APP_ICONS.logoTiktok,
  },
] as const;
