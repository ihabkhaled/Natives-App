import { useAppTranslation } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveAsyncViewStatus } from '@/shared/view';

import {
  buildRosterCardViews,
  buildStaffGroupViews,
  buildTeamHeroView,
} from '../helpers/team-directory-view.helper';
import { teamDirectoryPath } from '../routes/team-directory.paths';
import {
  TEAM_DIRECTORY_ENDPOINT_LIVE,
  TEAM_DIRECTORY_SCREEN_COPY_KEYS,
  TEAM_DIRECTORY_SLUG,
} from '../team-directory.constants';
import type { TeamDirectoryScreenView } from '../types/team-directory-view.types';
import { useTeamDirectoryQuery } from './use-team-directory-query.hook';

/**
 * Prepared, translated view model for the public `/team` page: the team hero,
 * the season board grouped by responsibility, and the active roster.
 *
 * The screen is honest about the seam — while `TEAM_DIRECTORY_ENDPOINT_LIVE`
 * is false it renders a notice explaining that portraits and the full roster
 * arrive with the public directory endpoint, instead of pretending the page is
 * already complete.
 */
export function useTeamDirectoryScreen(): TeamDirectoryScreenView {
  const { t } = useAppTranslation();
  const keys = I18N_KEYS.teamDirectory;
  const network = useNetworkStatus();
  const query = useTeamDirectoryQuery(TEAM_DIRECTORY_SLUG);
  const directory = query.data ?? null;
  const staffGroups = buildStaffGroupViews(t, directory);
  const rosterCards = buildRosterCardViews(t, directory);

  return {
    ...buildScreenCopy(t, {
      keys: TEAM_DIRECTORY_SCREEN_COPY_KEYS,
      error: query.error,
      isOffline: !network.isOnline,
      onRetry: query.refetch,
      emptyTitleKey: keys.emptyTitle,
      emptyMessageKey: keys.emptyMessage,
    }),
    path: teamDirectoryPath(),
    pageTitle: t(keys.title),
    seoTitle: `${t(keys.title)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(keys.metaDescription),
    status: resolveAsyncViewStatus({
      isForbidden: false,
      isLoading: query.isLoading,
      hasError: query.error !== null,
      isOffline: !network.isOnline,
      hasData: directory !== null,
      hasItems: staffGroups.length > 0 || rosterCards.length > 0,
    }),
    hero: buildTeamHeroView(t, directory),
    isEndpointLive: TEAM_DIRECTORY_ENDPOINT_LIVE,
    seamNoticeTitle: t(keys.seamNoticeTitle),
    seamNoticeMessage: t(keys.seamNoticeMessage),
    staffHeading: t(keys.staffHeading),
    staffIntro: t(keys.staffIntro),
    staffGroups,
    rosterHeading: t(keys.rosterHeading),
    rosterIntro: t(keys.rosterIntro),
    rosterCountLabel: t(keys.rosterCountLabel, { total: rosterCards.length }),
    rosterCards,
  };
}
