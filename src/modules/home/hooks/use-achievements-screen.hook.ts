import { useAppTranslation } from '@/packages/i18n';

import type { PublicSectionPageView } from '../components/public-section-page';
import { PUBLIC_PAGE } from '../constants/public-pages.constants';
import {
  buildAchievementsSection,
  type AchievementsSectionView,
} from '../helpers/landing-static-sections.helper';
import { usePublicSectionPage } from './use-public-section-page.hook';

export interface AchievementsScreenView {
  readonly page: PublicSectionPageView;
  readonly achievements: AchievementsSectionView;
}

/** The team's facts and figures as its own page. */
export function useAchievementsScreen(): AchievementsScreenView {
  const { t } = useAppTranslation();
  return {
    page: usePublicSectionPage(PUBLIC_PAGE.Achievements),
    achievements: buildAchievementsSection(t),
  };
}
