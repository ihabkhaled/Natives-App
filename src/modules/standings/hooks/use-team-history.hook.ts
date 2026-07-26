import { useState } from 'react';

import { buildMembersDirectoryQueryOptions } from '@/modules/members';
import { buildSeasonsQueryOptions } from '@/modules/teams';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { toRemoteQueryView } from '@/shared/view';

import {
  STANDINGS_FILTER_ALL,
  STANDINGS_LIMITS,
  STANDINGS_MEMBERS_PAGE_SIZE,
  type AchievementCategory,
} from '../constants/standings.constants';
import { buildHistoryResolvers, buildTeamHistoryScreenView } from '../helpers/history-view.helper';
import { buildTeamHistoryQueryOptions } from '../queries/standings.query';
import { achievementsPagePath } from '../routes/standings.paths';
import type { TeamHistoryEntry, TeamHistoryPage } from '../types/achievements.types';
import type { TeamHistoryScreenView } from '../types/achievements-view.types';
import { useStandingsContext } from './use-standings-context.hook';

/**
 * View model of the trophy cabinet: approved entries grouped into a season
 * timeline (nulls under "Earlier"), category chips, and a bounded "load
 * more". Approval chrome is intentionally absent — the endpoint only ever
 * returns approved, non-staff entries.
 */
export function useTeamHistory(): TeamHistoryScreenView {
  const { t, locale } = useAppTranslation();
  const context = useStandingsContext();
  const navigation = useAppNavigation();
  const [category, setCategory] = useState<string>(STANDINGS_FILTER_ALL);
  const [loadedPages, setLoadedPages] = useState<readonly (readonly TeamHistoryEntry[])[]>([]);
  const [offset, setOffset] = useState(0);

  const pageQuery = toRemoteQueryView<TeamHistoryPage>(
    useAppQuery(
      buildTeamHistoryQueryOptions(
        context.teamId,
        { category: category === STANDINGS_FILTER_ALL ? null : (category as AchievementCategory) },
        offset,
      ),
    ),
  );
  const seasonsQuery = toRemoteQueryView(
    useAppQuery(buildSeasonsQueryOptions(context.teamId, context.teamId !== '')),
  );
  const membersQuery = toRemoteQueryView(
    useAppQuery(
      buildMembersDirectoryQueryOptions(context.teamId, { pageSize: STANDINGS_MEMBERS_PAGE_SIZE }),
    ),
  );

  const currentEntries = pageQuery.data?.items ?? [];
  const entries = [...loadedPages.flat(), ...currentEntries];
  const total = pageQuery.data?.total ?? 0;

  return buildTeamHistoryScreenView(t, {
    context,
    pageQuery,
    locale,
    entries,
    total,
    hasMore: pageQuery.data !== undefined && offset + currentEntries.length < total,
    categoryValue: category,
    resolvers: buildHistoryResolvers(seasonsQuery.data, membersQuery.data?.items),
    onCategoryChange: (value) => {
      setCategory(value);
      setLoadedPages([]);
      setOffset(0);
    },
    onLoadMore: () => {
      setLoadedPages((pages) => [...pages, currentEntries]);
      setOffset((current) => current + STANDINGS_LIMITS.historyPageSize);
    },
    onOpenManage: () => {
      navigation.push(achievementsPagePath());
    },
  });
}
