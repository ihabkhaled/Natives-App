import { I18N_KEYS } from '@/shared/i18n';

type Translate = (key: string) => string;

export interface HeroSectionView {
  readonly eyebrow: string;
  readonly title: string;
  readonly tagline: string;
  readonly founded: string;
  readonly primaryCtaLabel: string;
  readonly secondaryCtaLabel: string;
  readonly onPrimaryCta: () => void;
  readonly onSecondaryCta: () => void;
}

/** The hero: team name, tagline, founding notice, and the two primary CTAs. */
export function buildHeroSection(
  t: Translate,
  onPrimaryCta: () => void,
  onSecondaryCta: () => void,
): HeroSectionView {
  return {
    eyebrow: t(I18N_KEYS.landing.heroEyebrow),
    title: t(I18N_KEYS.landing.heroTitle),
    tagline: t(I18N_KEYS.landing.heroTagline),
    founded: t(I18N_KEYS.landing.heroFounded),
    primaryCtaLabel: t(I18N_KEYS.landing.heroPrimaryCta),
    secondaryCtaLabel: t(I18N_KEYS.landing.heroSecondaryCta),
    onPrimaryCta,
    onSecondaryCta,
  };
}
