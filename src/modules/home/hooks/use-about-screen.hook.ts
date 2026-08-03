import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { aboutPath } from '../routes/home.paths';

interface AboutFact {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

interface AboutSpiritValue {
  readonly key: string;
  readonly title: string;
  readonly body: string;
}

export interface AboutScreenView {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly heroEyebrow: string;
  readonly heroTitle: string;
  readonly foundingQuote: string;
  readonly storyHeading: string;
  /** The club's history in order, rendered as consecutive paragraphs. */
  readonly storyParagraphs: readonly string[];
  readonly factsHeading: string;
  readonly facts: readonly AboutFact[];
  readonly explainerHeading: string;
  readonly explainerBody: string;
  readonly spiritHeading: string;
  readonly spiritIntro: string;
  readonly spiritValues: readonly AboutSpiritValue[];
}

/** Prepared, translated view model for the static About Us screen. */
export function useAboutScreen(): AboutScreenView {
  const { t } = useAppTranslation();
  const keys = I18N_KEYS.about;
  return {
    path: aboutPath(),
    seoTitle: `${t(keys.title)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(keys.metaDescription),
    heroEyebrow: t(keys.heroEyebrow),
    heroTitle: t(keys.heroTitle),
    foundingQuote: t(keys.foundingQuote),
    storyHeading: t(keys.storyHeading),
    storyParagraphs: [
      t(keys.storyEarly),
      t(keys.storySelfCoached),
      t(keys.storySeasonPrevious),
      t(keys.storySeasonCurrent),
      t(keys.storySpiritNote),
    ],
    factsHeading: t(keys.factsHeading),
    facts: [
      { key: 'sport', label: t(keys.factSportLabel), value: t(keys.factSportValue) },
      { key: 'founded', label: t(keys.factFoundedLabel), value: t(keys.factFoundedValue) },
      { key: 'location', label: t(keys.factLocationLabel), value: t(keys.factLocationValue) },
      { key: 'roster', label: t(keys.factRosterLabel), value: t(keys.factRosterValue) },
    ],
    explainerHeading: t(keys.explainerHeading),
    explainerBody: t(keys.explainerBody),
    spiritHeading: t(keys.spiritHeading),
    spiritIntro: t(keys.spiritIntro),
    spiritValues: [
      { key: 'fairness', title: t(keys.spiritValue1Title), body: t(keys.spiritValue1Body) },
      { key: 'respect', title: t(keys.spiritValue2Title), body: t(keys.spiritValue2Body) },
      { key: 'joy', title: t(keys.spiritValue3Title), body: t(keys.spiritValue3Body) },
      { key: 'effort', title: t(keys.spiritValue4Title), body: t(keys.spiritValue4Body) },
    ],
  };
}
