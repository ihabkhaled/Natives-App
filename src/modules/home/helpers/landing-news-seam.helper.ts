import { I18N_KEYS } from '@/shared/i18n';

import { buildLandingSeamChrome, type LandingSeamChrome } from './landing-seam-copy.helper';

type Translate = (key: string) => string;

export interface NewsSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly chrome: LandingSeamChrome;
}

/** Team & competition news — the module ships alongside contract 1.8.0. */
export function buildNewsSection(t: Translate): NewsSectionView {
  return {
    heading: t(I18N_KEYS.landing.newsHeading),
    intro: t(I18N_KEYS.landing.newsIntro),
    chrome: buildLandingSeamChrome(
      t,
      false,
      I18N_KEYS.landing.newsEmptyTitle,
      I18N_KEYS.landing.newsEmptyMessage,
    ),
  };
}
