import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { SQUADS_COPY_NAMESPACE } from '../constants/competitions-labels.constants';
import { ROSTER_KIND_LABEL_KEYS } from '../constants/rosters-labels.constants';
import { ROSTER_KINDS } from '../constants/rosters.constants';
import { ALL_FILTER } from '../constants/competitions.constants';
import { buildFilterOptions, matchesFilter } from '../helpers/competition-view.helper';
import {
  buildCompetitionsScreenCopy,
  resolveCompetitionsScreenStatus,
} from '../helpers/competitions-copy.helper';
import { buildRosterCard } from '../helpers/roster-detail.helper';
import { rosterDetailPath } from '../routes/competitions.paths';
import type { RostersListView } from '../types/rosters-view.types';
import { useCompetitionsContext } from './use-competitions-context.hook';
import { useRostersQuery } from './use-rosters-query.hook';

/** Prepared, translated view model for the competition and match roster list. */
export function useRostersList(): RostersListView {
  const { t, locale } = useAppTranslation();
  const context = useCompetitionsContext();
  const navigation = useAppNavigation();
  const [kindFilter, setKindFilter] = useState<string>(ALL_FILTER);

  const query = useRostersQuery(context.teamId);
  const page = query.data ?? { items: [], total: 0 };
  const matches = page.items.filter((item) => matchesFilter(item.rosterKind, kindFilter));

  return {
    ...buildCompetitionsScreenCopy(t, {
      namespace: SQUADS_COPY_NAMESPACE,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.rosters.emptyTitle,
      emptyMessageKey: I18N_KEYS.rosters.emptyMessage,
    }),
    title: t(I18N_KEYS.rosters.title),
    subtitle: t(I18N_KEYS.rosters.subtitle),
    status: resolveCompetitionsScreenStatus(
      context,
      query,
      context.canReadRoster,
      page.items.length > 0,
    ),
    countLabel: t(I18N_KEYS.rosters.countSummary, { shown: matches.length, total: page.total }),
    kindFilterLabel: t(I18N_KEYS.rosters.kindFilterLabel),
    kindFilter,
    kindOptions: buildFilterOptions(
      t,
      ROSTER_KINDS,
      ROSTER_KIND_LABEL_KEYS,
      I18N_KEYS.rosters.filterAll,
    ),
    items: matches.map((item) => buildRosterCard(t, locale, item)),
    hasMatches: matches.length > 0,
    noMatchesTitle: t(I18N_KEYS.rosters.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.rosters.noMatchesMessage),
    onKindFilterChange: setKindFilter,
    onOpen: (rosterId: string) => {
      navigation.push(rosterDetailPath(rosterId));
    },
  };
}
