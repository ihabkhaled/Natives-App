import { APP_PATHS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

/**
 * The standalone public pages split out of the landing page. Adding a page is
 * one entry here plus a container — the path, copy keys and nav label all
 * travel together so none of them can be forgotten.
 */
export const PUBLIC_PAGE = {
  Ultimate: 'ultimate',
  Spirit: 'spirit',
  Gallery: 'gallery',
  Location: 'location',
  Achievements: 'achievements',
} as const;

export type PublicPageKey = (typeof PUBLIC_PAGE)[keyof typeof PUBLIC_PAGE];

interface PublicPageDefinition {
  readonly path: string;
  readonly eyebrowKey: string;
  readonly titleKey: string;
  readonly seoTitleKey: string;
  readonly seoDescriptionKey: string;
  readonly navLabelKey: string;
}

const KEYS = I18N_KEYS.publicPages;

export const PUBLIC_PAGE_DEFINITIONS: Readonly<Record<PublicPageKey, PublicPageDefinition>> = {
  [PUBLIC_PAGE.Ultimate]: {
    path: APP_PATHS.ultimate,
    eyebrowKey: KEYS.ultimateEyebrow,
    titleKey: KEYS.ultimateTitle,
    seoTitleKey: KEYS.ultimateMetaTitle,
    seoDescriptionKey: KEYS.ultimateMetaDescription,
    navLabelKey: KEYS.navUltimate,
  },
  [PUBLIC_PAGE.Spirit]: {
    path: APP_PATHS.spirit,
    eyebrowKey: KEYS.spiritEyebrow,
    titleKey: KEYS.spiritTitle,
    seoTitleKey: KEYS.spiritMetaTitle,
    seoDescriptionKey: KEYS.spiritMetaDescription,
    navLabelKey: KEYS.navSpirit,
  },
  [PUBLIC_PAGE.Gallery]: {
    path: APP_PATHS.gallery,
    eyebrowKey: KEYS.galleryEyebrow,
    titleKey: KEYS.galleryTitle,
    seoTitleKey: KEYS.galleryMetaTitle,
    seoDescriptionKey: KEYS.galleryMetaDescription,
    navLabelKey: KEYS.navGallery,
  },
  [PUBLIC_PAGE.Location]: {
    path: APP_PATHS.location,
    eyebrowKey: KEYS.locationEyebrow,
    titleKey: KEYS.locationTitle,
    seoTitleKey: KEYS.locationMetaTitle,
    seoDescriptionKey: KEYS.locationMetaDescription,
    navLabelKey: KEYS.navLocation,
  },
  [PUBLIC_PAGE.Achievements]: {
    path: APP_PATHS.publicAchievements,
    eyebrowKey: KEYS.achievementsEyebrow,
    titleKey: KEYS.achievementsTitle,
    seoTitleKey: KEYS.achievementsMetaTitle,
    seoDescriptionKey: KEYS.achievementsMetaDescription,
    navLabelKey: KEYS.navAchievements,
  },
};
