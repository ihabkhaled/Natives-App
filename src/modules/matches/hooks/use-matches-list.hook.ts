import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { MATCHES_COPY_NAMESPACE } from '../constants/matches-labels.constants';
import {
  ALL_MATCH_FILTER,
  buildMatchCard,
  buildMatchStatusOptions,
  matchesStatusFilter,
} from '../helpers/match-list-view.helper';
import { buildMatchesScreenCopy, resolveMatchesScreenStatus } from '../helpers/matches-copy.helper';
import { matchScoreboardPath, matchStatisticsPath } from '../routes/matches.paths';
import { useMatchesContext } from './use-matches-context.hook';
import { useMatchesQuery } from './use-matches-query.hook';
import type { MatchesListView } from '../types/matches-view.types';

/**
 * Prepared, translated view model for the match list: one client-side status
 * filter over one bounded page, and exactly one screen state.
 */
export function useMatchesList(): MatchesListView {
  const { t } = useAppTranslation();
  const context = useMatchesContext();
  const navigation = useAppNavigation();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_MATCH_FILTER);

  const query = useMatchesQuery(context.teamId);
  const page = query.data ?? { items: [], total: 0 };
  const matches = page.items.filter((item) => matchesStatusFilter(item.status, statusFilter));

  return {
    ...buildMatchesScreenCopy(t, {
      namespace: MATCHES_COPY_NAMESPACE,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.matches.emptyTitle,
      emptyMessageKey: I18N_KEYS.matches.emptyMessage,
    }),
    title: t(I18N_KEYS.matches.title),
    subtitle: t(I18N_KEYS.matches.subtitle),
    status: resolveMatchesScreenStatus(
      context,
      query,
      context.canReadMatches,
      page.items.length > 0,
    ),
    countLabel: t(I18N_KEYS.matches.countSummary, { shown: matches.length, total: page.total }),
    statusFilterLabel: t(I18N_KEYS.matches.statusFilterLabel),
    statusFilter,
    statusOptions: buildMatchStatusOptions(t),
    items: matches.map((match) => buildMatchCard(t, match)),
    hasMatches: matches.length > 0,
    noMatchesTitle: t(I18N_KEYS.matches.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.matches.noMatchesMessage),
    onStatusFilterChange: setStatusFilter,
    onOpenScoreboard: (matchId: string) => {
      navigation.push(matchScoreboardPath(matchId));
    },
    onOpenStatistics: (matchId: string) => {
      navigation.push(matchStatisticsPath(matchId));
    },
  };
}
