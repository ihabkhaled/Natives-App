import { useAppTranslation } from '@/packages/i18n';

import type { PublicSectionPageView } from '../components/public-section-page';
import {
  PUBLIC_PAGE_DEFINITIONS,
  type PublicPageKey,
} from '../constants/public-pages.constants';

/**
 * Builds the frame (title, eyebrow, canonical path and SEO copy) for one of
 * the standalone public pages. The page's actual content comes from the same
 * section builders the landing page uses, so the two can never disagree.
 */
export function usePublicSectionPage(page: PublicPageKey): PublicSectionPageView {
  const { t } = useAppTranslation();
  const definition = PUBLIC_PAGE_DEFINITIONS[page];

  return {
    path: definition.path,
    eyebrow: t(definition.eyebrowKey),
    title: t(definition.titleKey),
    seoTitle: t(definition.seoTitleKey),
    seoDescription: t(definition.seoDescriptionKey),
  };
}
