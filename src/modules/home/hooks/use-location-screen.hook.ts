import { useAppTranslation } from '@/packages/i18n';

import type { PublicSectionPageView } from '../components/public-section-page';
import { PUBLIC_PAGE } from '../constants/public-pages.constants';
import {
  buildLocationSection,
  type LocationSectionView,
} from '../helpers/landing-static-sections.helper';
import { usePublicSectionPage } from './use-public-section-page.hook';

export interface LocationScreenView {
  readonly page: PublicSectionPageView;
  readonly location: LocationSectionView;
}

/** Home turf in El Sheikh Zayed as its own page, so it can rank locally. */
export function useLocationScreen(): LocationScreenView {
  const { t } = useAppTranslation();
  return {
    page: usePublicSectionPage(PUBLIC_PAGE.Location),
    location: buildLocationSection(t),
  };
}
