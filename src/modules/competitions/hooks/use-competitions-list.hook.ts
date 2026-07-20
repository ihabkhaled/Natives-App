import { useState } from 'react';

import { formatDate } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import {
  COMPETITIONS_COPY_NAMESPACE,
  COMPETITION_STATUS_LABEL_KEYS,
  COMPETITION_TYPE_LABEL_KEYS,
} from '../constants/competitions-labels.constants';
import {
  ALL_FILTER,
  COMPETITION_STATUSES,
  COMPETITION_TYPES,
} from '../constants/competitions.constants';
import {
  buildCompetitionsScreenCopy,
  resolveCompetitionsScreenStatus,
} from '../helpers/competitions-copy.helper';
import {
  buildCompetitionCard,
  buildFilterOptions,
  matchesFilter,
} from '../helpers/competition-view.helper';
import { competitionDetailPath, squadsPath } from '../routes/competitions.paths';
import type { CompetitionsListView } from '../types/competitions-view.types';
import { useCompetitionsContext } from './use-competitions-context.hook';
import { useCompetitionsQuery } from './use-competitions-query.hook';

/**
 * Prepared, translated view model for the competition list: two client-side
 * filters over one bounded page, and exactly one screen state.
 */
export function useCompetitionsList(): CompetitionsListView {
  const { t, locale } = useAppTranslation();
  const context = useCompetitionsContext();
  const navigation = useAppNavigation();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER);
  const [typeFilter, setTypeFilter] = useState<string>(ALL_FILTER);

  const query = useCompetitionsQuery(context.teamId);
  const page = query.data ?? { items: [], total: 0 };
  const matches = page.items.filter(
    (item) =>
      matchesFilter(item.status, statusFilter) && matchesFilter(item.competitionType, typeFilter),
  );
  const formatDay = (isoDate: string): string => formatDate(isoDate, locale);

  return {
    ...buildCompetitionsScreenCopy(t, {
      namespace: COMPETITIONS_COPY_NAMESPACE,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.competitions.emptyTitle,
      emptyMessageKey: I18N_KEYS.competitions.emptyMessage,
    }),
    title: t(I18N_KEYS.competitions.title),
    subtitle: t(I18N_KEYS.competitions.subtitle),
    status: resolveCompetitionsScreenStatus(
      context,
      query,
      context.canReadCompetitions,
      page.items.length > 0,
    ),
    countLabel: t(I18N_KEYS.competitions.countSummary, {
      shown: matches.length,
      total: page.total,
    }),
    statusFilterLabel: t(I18N_KEYS.competitions.statusFilterLabel),
    statusFilter,
    statusOptions: buildFilterOptions(
      t,
      COMPETITION_STATUSES,
      COMPETITION_STATUS_LABEL_KEYS,
      I18N_KEYS.competitions.filterAll,
    ),
    typeFilterLabel: t(I18N_KEYS.competitions.typeFilterLabel),
    typeFilter,
    typeOptions: buildFilterOptions(
      t,
      COMPETITION_TYPES,
      COMPETITION_TYPE_LABEL_KEYS,
      I18N_KEYS.competitions.filterAll,
    ),
    items: matches.map((item) => buildCompetitionCard(t, formatDay, item)),
    hasMatches: matches.length > 0,
    noMatchesTitle: t(I18N_KEYS.competitions.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.competitions.noMatchesMessage),
    squadsLinkLabel: t(I18N_KEYS.competitions.squadsLink),
    onStatusFilterChange: setStatusFilter,
    onTypeFilterChange: setTypeFilter,
    onOpen: (competitionId: string) => {
      navigation.push(competitionDetailPath(competitionId));
    },
    onOpenSquads: () => {
      navigation.push(squadsPath());
    },
  };
}
