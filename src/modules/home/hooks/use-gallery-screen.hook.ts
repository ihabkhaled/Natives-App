import { useAppTranslation } from '@/packages/i18n';

import type { PublicSectionPageView } from '../components/public-section-page';
import { PUBLIC_PAGE } from '../constants/public-pages.constants';
import {
  buildGallerySection,
  type GallerySectionView,
} from '../helpers/landing-static-sections.helper';
import { usePublicSectionPage } from './use-public-section-page.hook';

export interface GalleryScreenView {
  readonly page: PublicSectionPageView;
  readonly gallery: GallerySectionView;
}

/** Season photo gallery as its own page. */
export function useGalleryScreen(): GalleryScreenView {
  const { t } = useAppTranslation();
  return {
    page: usePublicSectionPage(PUBLIC_PAGE.Gallery),
    gallery: buildGallerySection(t),
  };
}
