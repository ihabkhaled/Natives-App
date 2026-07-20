import { useState } from 'react';

import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import {
  SQUADS_COPY_NAMESPACE,
  SQUAD_STATUS_LABEL_KEYS,
} from '../constants/competitions-labels.constants';
import { ALL_FILTER, SQUAD_STATUSES } from '../constants/competitions.constants';
import { buildFilterOptions, matchesFilter } from '../helpers/competition-view.helper';
import {
  buildCompetitionsScreenCopy,
  resolveCompetitionsScreenStatus,
} from '../helpers/competitions-copy.helper';
import { buildSquadCard } from '../helpers/squad-view.helper';
import { squadDetailPath } from '../routes/competitions.paths';
import type { SquadsListView } from '../types/competitions-view.types';
import { useCompetitionsContext } from './use-competitions-context.hook';
import { useSquadsQuery } from './use-squads-query.hook';

/** Prepared, translated view model for the season squad list. */
export function useSquadsList(): SquadsListView {
  const { t, locale } = useAppTranslation();
  const context = useCompetitionsContext();
  const navigation = useAppNavigation();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER);

  const query = useSquadsQuery(context.teamId);
  const page = query.data ?? { items: [], total: 0 };
  const matches = page.items.filter((item) => matchesFilter(item.status, statusFilter));
  const formatInstant = (iso: string): string => formatCairoDateTime(iso, locale);

  return {
    ...buildCompetitionsScreenCopy(t, {
      namespace: SQUADS_COPY_NAMESPACE,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.squads.emptyTitle,
      emptyMessageKey: I18N_KEYS.squads.emptyMessage,
    }),
    title: t(I18N_KEYS.squads.title),
    subtitle: t(I18N_KEYS.squads.subtitle),
    status: resolveCompetitionsScreenStatus(
      context,
      query,
      context.canReadSquads,
      page.items.length > 0,
    ),
    countLabel: t(I18N_KEYS.squads.countSummary, { shown: matches.length, total: page.total }),
    statusFilterLabel: t(I18N_KEYS.squads.statusFilterLabel),
    statusFilter,
    statusOptions: buildFilterOptions(
      t,
      SQUAD_STATUSES,
      SQUAD_STATUS_LABEL_KEYS,
      I18N_KEYS.squads.filterAll,
    ),
    items: matches.map((item) => buildSquadCard(t, formatInstant, item)),
    hasMatches: matches.length > 0,
    noMatchesTitle: t(I18N_KEYS.squads.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.squads.noMatchesMessage),
    onStatusFilterChange: setStatusFilter,
    onOpen: (squadId: string) => {
      navigation.push(squadDetailPath(squadId));
    },
  };
}
