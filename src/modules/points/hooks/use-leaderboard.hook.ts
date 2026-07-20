import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { resolveAsyncViewStatus } from '@/shared/view';

import { ALL_CATEGORIES } from '../constants/points-filter.constants';
import {
  LEADERBOARD_COHORT,
  LEADERBOARD_PERIOD,
  type LeaderboardCohort,
  type LeaderboardPeriod,
} from '../constants/points.constants';
import { buildLeaderboardChrome } from '../helpers/leaderboard-screen.helper';
import {
  buildCohortOptions,
  buildLeaderboardRows,
  buildPeriodOptions,
} from '../helpers/leaderboard-view.helper';
import { buildPointsScreenCopy } from '../helpers/points-copy.helper';
import type { LeaderboardView } from '../types/points-view.types';
import { useLeaderboardQuery } from './use-leaderboard-query.hook';
import { usePointsContext } from './use-points-context.hook';

/**
 * Prepared, translated view model for the team leaderboard: period / cohort /
 * category scopes, the server's tie-break rule shown verbatim, rank movement
 * with a non-colour glyph, and a per-row rank explanation. Zero-contribution
 * members stay on the board — nothing here filters a row by its total.
 */
export function useLeaderboard(): LeaderboardView {
  const { t, locale } = useAppTranslation();
  const context = usePointsContext();
  const [period, setPeriod] = useState<LeaderboardPeriod>(LEADERBOARD_PERIOD.season);
  const [cohort, setCohort] = useState<LeaderboardCohort>(LEADERBOARD_COHORT.all);
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [expandedId, setExpandedId] = useState('');

  const filters = {
    period,
    cohort,
    category: category === ALL_CATEGORIES ? null : category,
  };
  const query = useLeaderboardQuery(context.teamId, filters);
  const board = query.data ?? null;
  const rows = board?.rows ?? [];

  return {
    ...buildPointsScreenCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
    }),
    ...buildLeaderboardChrome(t, {
      board,
      filters,
      locale,
      periodOptions: buildPeriodOptions(t),
      cohortOptions: buildCohortOptions(t),
    }),
    title: t(I18N_KEYS.points.leaderboardTitle),
    subtitle: t(I18N_KEYS.points.leaderboardSubtitle),
    status: resolveAsyncViewStatus({
      isForbidden: !context.isLoading && !context.canReadLeaderboard,
      isLoading: context.isLoading || query.isLoading,
      hasError: query.error !== null,
      isOffline: context.isOffline,
      hasData: board !== null,
      hasItems: rows.length > 0,
    }),
    rows: buildLeaderboardRows(t, { rows, expandedId, ruleVersion: null }),
    onPeriodChange: (value: string) => {
      setPeriod(value as LeaderboardPeriod);
      setExpandedId('');
    },
    onCohortChange: (value: string) => {
      setCohort(value as LeaderboardCohort);
      setExpandedId('');
    },
    onCategoryChange: (value: string) => {
      setCategory(value);
      setExpandedId('');
    },
    onToggleExplain: (membershipId: string) => {
      setExpandedId((current) => (current === membershipId ? '' : membershipId));
    },
  };
}
