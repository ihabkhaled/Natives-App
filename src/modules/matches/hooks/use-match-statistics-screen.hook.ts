import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';

import { EMPTY_MATCH_STATISTICS } from '../constants/statistics-placeholder.constants';
import { buildMatchStatisticsView } from '../helpers/match-statistics-screen.helper';
import { buildNameResolver } from '../helpers/member-options.helper';
import { resolveMatchesScreenStatus } from '../helpers/matches-copy.helper';
import { MATCH_ID_PARAM, matchesPath } from '../routes/matches.paths';
import { useMatchRosterQuery } from './use-match-roster-query.hook';
import { useMatchStatisticsQuery } from './use-match-statistics-query.hook';
import { useMatchesContext } from './use-matches-context.hook';
import type { MatchStatisticsScreenView } from '../types/matches-view.types';

/**
 * Prepared, translated view model for the derived match statistics, the
 * per-player reports, and the honestly-empty video analysis surface.
 */
export function useMatchStatisticsScreen(): MatchStatisticsScreenView {
  const { t, locale } = useAppTranslation();
  const context = useMatchesContext();
  const navigation = useAppNavigation();
  const matchId = useRouteParam(MATCH_ID_PARAM) ?? '';
  const [openReportId, setOpenReportId] = useState<string | null>(null);

  const statisticsQuery = useMatchStatisticsQuery(context.teamId, matchId);
  const rosterQuery = useMatchRosterQuery(context.teamId);
  const statistics = statisticsQuery.data ?? EMPTY_MATCH_STATISTICS;

  return buildMatchStatisticsView(t, {
    locale,
    statistics,
    resolveName: buildNameResolver(rosterQuery.data?.items ?? []),
    status: resolveMatchesScreenStatus(
      context,
      statisticsQuery,
      context.canReadStatistics,
      statistics.players.length > 0,
    ),
    error: statisticsQuery.error,
    isOffline: context.isOffline,
    openReportMembershipId: openReportId,
    onRetry: statisticsQuery.refetch,
    onBack: () => {
      navigation.push(matchesPath());
    },
    onOpenReport: setOpenReportId,
    onCloseReport: () => {
      setOpenReportId(null);
    },
  });
}
