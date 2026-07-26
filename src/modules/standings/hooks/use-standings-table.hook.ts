import { useState } from 'react';

import { buildCompetitionsQueryOptions } from '@/modules/competitions';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation, useSearchParam } from '@/packages/router';
import { toRemoteQueryView } from '@/shared/view';

import { STANDINGS_FILTER_ALL, type StandingSource } from '../constants/standings.constants';
import { buildStandingsScreenView } from '../helpers/standings-screen-view.helper';
import { resolveActiveCompetitionId } from '../helpers/standings-view.helper';
import {
  buildStandingsQueryOptions,
  buildStandingsRulesQueryOptions,
} from '../queries/standings.query';
import { standingsRulesPagePath } from '../routes/standings.paths';
import type { StandingsPage, StandingsRulesPage } from '../types/standings.types';
import type { StandingsScreenView } from '../types/standings-view.types';
import { useStandingsContext } from './use-standings-context.hook';
import { useStandingsManage } from './use-standings-manage.hook';

/**
 * View model of the standings screen: competition scope (deep-linkable via
 * `?competitionId=`), source facet, server-sorted rows, the rule-version
 * footer, and — for competition.manage — the recompute/manual concern
 * delegated to the manage sub-hook. The client never re-ranks a row.
 */
export function useStandingsTable(): StandingsScreenView {
  const { t, locale } = useAppTranslation();
  const context = useStandingsContext();
  const navigation = useAppNavigation();
  const linkedCompetitionId = useSearchParam('competitionId');

  const [competitionId, setCompetitionId] = useState('');
  const [source, setSource] = useState<string>(STANDINGS_FILTER_ALL);
  const [banner, setBanner] = useState<string | null>(null);

  const competitionsQuery = toRemoteQueryView(
    useAppQuery(buildCompetitionsQueryOptions(context.teamId)),
  );
  const competitions = competitionsQuery.data?.items ?? [];
  const activeCompetitionId = resolveActiveCompetitionId(
    competitionId,
    linkedCompetitionId,
    competitions,
  );

  const tableQuery = toRemoteQueryView<StandingsPage>(
    useAppQuery(
      buildStandingsQueryOptions(context.teamId, {
        competitionId: activeCompetitionId,
        source: source === STANDINGS_FILTER_ALL ? null : (source as StandingSource),
      }),
    ),
  );
  const rulesQuery = toRemoteQueryView<StandingsRulesPage>(
    useAppQuery(buildStandingsRulesQueryOptions(context.teamId)),
  );
  const rules = rulesQuery.data?.rules ?? [];
  const rows = tableQuery.data?.rows ?? [];

  const { manage } = useStandingsManage(t, {
    teamId: context.teamId,
    canManage: context.canManage,
    isOffline: context.isOffline,
    ruleOptions: rules
      .filter((rule) => rule.status === 'active')
      .map((rule) => ({ value: rule.ruleKey, label: rule.name })),
    activeCompetitionId,
    onBanner: setBanner,
  });

  return buildStandingsScreenView(t, {
    context,
    tableQuery,
    competitionsQuery,
    rows,
    onRetry: tableQuery.refetch,
    chrome: {
      locale,
      competitions,
      activeCompetitionId,
      source,
      rows,
      rules,
      onCompetitionChange: setCompetitionId,
      onSourceChange: setSource,
      onOpenRules: () => {
        navigation.push(standingsRulesPagePath());
      },
    },
    manage,
    recomputeBanner: banner,
  });
}
