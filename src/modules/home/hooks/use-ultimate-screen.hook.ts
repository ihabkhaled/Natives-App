import { useAppTranslation } from '@/packages/i18n';

import type { PublicSectionPageView } from '../components/public-section-page';
import { PUBLIC_PAGE } from '../constants/public-pages.constants';
import {
  buildExplainerSection,
  type ExplainerSectionView,
} from '../helpers/landing-static-sections.helper';
import { usePublicSectionPage } from './use-public-section-page.hook';

export interface UltimateScreenView {
  readonly page: PublicSectionPageView;
  readonly explainer: ExplainerSectionView;
}

/** "What is Ultimate Frisbee?" as its own page, for visitors new to the sport. */
export function useUltimateScreen(): UltimateScreenView {
  const { t } = useAppTranslation();
  return {
    page: usePublicSectionPage(PUBLIC_PAGE.Ultimate),
    explainer: buildExplainerSection(t),
  };
}
