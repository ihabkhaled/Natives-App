import { useAppTranslation } from '@/packages/i18n';

import type { PublicSectionPageView } from '../components/public-section-page';
import { PUBLIC_PAGE } from '../constants/public-pages.constants';
import {
  buildSpiritValuesSection,
  type SpiritValuesSectionView,
} from '../helpers/landing-static-sections.helper';
import { usePublicSectionPage } from './use-public-section-page.hook';

export interface SpiritScreenView {
  readonly page: PublicSectionPageView;
  readonly spiritValues: SpiritValuesSectionView;
}

/** Spirit of the Game as its own page — the values that replace referees. */
export function useSpiritScreen(): SpiritScreenView {
  const { t } = useAppTranslation();
  return {
    page: usePublicSectionPage(PUBLIC_PAGE.Spirit),
    spiritValues: buildSpiritValuesSection(t),
  };
}
