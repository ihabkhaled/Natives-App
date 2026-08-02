import type { FactListItem } from '@/shared/ui';
import { I18N_KEYS } from '@/shared/i18n';

import type { SpiritValueItem } from '../components/spirit-values-grid';
import { TEAM_LOCATION_MAPS_URL } from '../constants/landing-location.constants';

type Translate = (key: string) => string;

const GALLERY_TILE_COUNT = 6;

export interface ExplainerSectionView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
}

/** "What is Ultimate Frisbee?" — a short, standalone explainer for a first-time visitor. */
export function buildExplainerSection(t: Translate): ExplainerSectionView {
  return {
    eyebrow: t(I18N_KEYS.landing.explainerEyebrow),
    heading: t(I18N_KEYS.landing.explainerHeading),
    body: t(I18N_KEYS.landing.explainerBody),
  };
}

export interface AboutPreviewSectionView {
  readonly heading: string;
  readonly quote: string;
  readonly ctaLabel: string;
  readonly onCtaClick: () => void;
}

/** Founding-story teaser that links through to the full About page. */
export function buildAboutPreviewSection(
  t: Translate,
  onCtaClick: () => void,
): AboutPreviewSectionView {
  return {
    heading: t(I18N_KEYS.landing.aboutPreviewHeading),
    quote: t(I18N_KEYS.landing.aboutPreviewQuote),
    ctaLabel: t(I18N_KEYS.landing.aboutPreviewCta),
    onCtaClick,
  };
}

export interface LocationSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly address: string;
  readonly ctaLabel: string;
  readonly mapAlt: string;
  readonly mapsHref: string;
}

/** El Sheikh Zayed, Giza, Egypt — a static illustrative map, never a key-bearing embed. */
export function buildLocationSection(t: Translate): LocationSectionView {
  return {
    heading: t(I18N_KEYS.landing.locationHeading),
    intro: t(I18N_KEYS.landing.locationIntro),
    address: t(I18N_KEYS.landing.locationAddress),
    ctaLabel: t(I18N_KEYS.landing.locationCta),
    mapAlt: t(I18N_KEYS.landing.locationMapAlt),
    mapsHref: TEAM_LOCATION_MAPS_URL,
  };
}

interface GalleryTileView {
  readonly key: string;
  readonly alt: string;
}

export interface GallerySectionView {
  readonly heading: string;
  readonly intro: string;
  readonly tiles: readonly GalleryTileView[];
}

/** Static placeholder tiles until real match-day photos are DB-managed. */
export function buildGallerySection(t: Translate): GallerySectionView {
  const alt = t(I18N_KEYS.landing.galleryPlaceholderAlt);
  return {
    heading: t(I18N_KEYS.landing.galleryHeading),
    intro: t(I18N_KEYS.landing.galleryIntro),
    tiles: Array.from({ length: GALLERY_TILE_COUNT }, (_value, index) => ({
      key: `tile-${index + 1}`,
      alt,
    })),
  };
}

export interface AchievementsSectionView {
  readonly heading: string;
  readonly items: readonly FactListItem[];
}

/** The stats every visitor should see at a glance — all facts, none invented. */
export function buildAchievementsSection(t: Translate): AchievementsSectionView {
  return {
    heading: t(I18N_KEYS.landing.achievementsHeading),
    items: [
      {
        key: 'founded',
        label: t(I18N_KEYS.landing.statFoundedLabel),
        value: t(I18N_KEYS.landing.statFoundedValue),
      },
      {
        key: 'roster',
        label: t(I18N_KEYS.landing.statRosterLabel),
        value: t(I18N_KEYS.landing.statRosterValue),
      },
      {
        key: 'location',
        label: t(I18N_KEYS.landing.statLocationLabel),
        value: t(I18N_KEYS.landing.statLocationValue),
      },
      {
        key: 'competitions',
        label: t(I18N_KEYS.landing.statCompetitionsLabel),
        value: t(I18N_KEYS.landing.statCompetitionsValue),
      },
    ],
  };
}

export interface FinalCtaSectionView {
  readonly heading: string;
  readonly body: string;
  readonly primaryLabel: string;
  readonly secondaryLabel: string;
  readonly onPrimaryClick: () => void;
  readonly onSecondaryClick: () => void;
}

/** The closing pitch: join tryouts, or get in touch. */
export function buildFinalCtaSection(
  t: Translate,
  onPrimaryClick: () => void,
  onSecondaryClick: () => void,
): FinalCtaSectionView {
  return {
    heading: t(I18N_KEYS.landing.finalCtaHeading),
    body: t(I18N_KEYS.landing.finalCtaBody),
    primaryLabel: t(I18N_KEYS.landing.finalCtaPrimary),
    secondaryLabel: t(I18N_KEYS.landing.finalCtaSecondary),
    onPrimaryClick,
    onSecondaryClick,
  };
}

export interface SpiritValuesSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly values: readonly SpiritValueItem[];
}

/**
 * The landing page reuses the About page's canonical Spirit-of-the-Game copy
 * verbatim (same `I18N_KEYS.about.*` keys) rather than re-authoring it, so
 * the two pages can never drift apart.
 */
export function buildSpiritValuesSection(t: Translate): SpiritValuesSectionView {
  const keys = I18N_KEYS.about;
  return {
    heading: t(keys.spiritHeading),
    intro: t(keys.spiritIntro),
    values: [
      { key: 'fairness', title: t(keys.spiritValue1Title), body: t(keys.spiritValue1Body) },
      { key: 'respect', title: t(keys.spiritValue2Title), body: t(keys.spiritValue2Body) },
      { key: 'joy', title: t(keys.spiritValue3Title), body: t(keys.spiritValue3Body) },
      { key: 'effort', title: t(keys.spiritValue4Title), body: t(keys.spiritValue4Body) },
    ],
  };
}
