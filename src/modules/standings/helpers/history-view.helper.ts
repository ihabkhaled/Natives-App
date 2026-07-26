import type { TranslateParams } from '@/packages/i18n';
import type { SelectFieldOption } from '@/shared/ui';
import type { RemoteQueryView } from '@/shared/view';
import { resolveScreenStatus } from '@/shared/view';
import { I18N_KEYS } from '@/shared/i18n';

import { ACHIEVEMENT_CATEGORIES, STANDINGS_FILTER_ALL } from '../constants/standings.constants';
import type { Season } from '@/modules/teams';
import type { MemberDirectoryItem } from '@/modules/members';
import type { TeamHistoryEntry, TeamHistoryPage } from '../types/achievements.types';
import type {
  HistoryEntryView,
  HistorySeasonView,
  TeamHistoryScreenView,
} from '../types/achievements-view.types';
import { buildStandingsScreenCopy } from './standings-copy.helper';
import {
  formatAchievedOn,
  resolveCategoryIcon,
  resolveCategoryLabel,
} from './achievement-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** The category filter options for the cabinet, "All" first. */
export function buildHistoryCategoryOptions(t: Translate): readonly SelectFieldOption[] {
  return [
    { value: STANDINGS_FILTER_ALL, label: t(I18N_KEYS.standings.achievementsFilterAll) },
    ...ACHIEVEMENT_CATEGORIES.map((value) => ({
      value,
      label: resolveCategoryLabel(t, value),
    })),
  ];
}

/** Name resolvers built from the season and member directories. */
export function buildHistoryResolvers(
  seasons: readonly Season[] | undefined,
  members: readonly MemberDirectoryItem[] | undefined,
): HistoryNameResolvers {
  return {
    seasonName: (seasonId) =>
      (seasons ?? []).find((season) => season.id === seasonId)?.name ?? null,
    memberName: (membershipId) =>
      (members ?? []).find((member) => member.membershipId === membershipId)?.displayName ?? null,
  };
}

/** Resolve display facts the cabinet cannot compute itself. */
export interface HistoryNameResolvers {
  readonly seasonName: (seasonId: string) => string | null;
  readonly memberName: (membershipId: string) => string | null;
}

/** One medal card; unresolvable member ids render the title alone. */
function buildHistoryEntryView(
  t: Translate,
  locale: string,
  entry: TeamHistoryEntry,
  resolvers: HistoryNameResolvers,
): HistoryEntryView {
  return {
    key: entry.achievementId,
    iconName: resolveCategoryIcon(entry.category),
    title: entry.title,
    achievedOn: formatAchievedOn(locale, entry.achievedOn),
    categoryLabel: resolveCategoryLabel(t, entry.category),
    memberName: entry.membershipId === null ? null : resolvers.memberName(entry.membershipId),
  };
}

/**
 * Group cabinet entries into a season timeline. Entries stay in the server's
 * order; seasons appear in first-encounter order with null seasons collected
 * under "Earlier".
 */
export function buildHistorySeasons(
  t: Translate,
  locale: string,
  entries: readonly TeamHistoryEntry[],
  resolvers: HistoryNameResolvers,
): readonly HistorySeasonView[] {
  const earlierKey = 'earlier';
  const seasons: { readonly key: string; readonly views: HistoryEntryView[] }[] = [];
  const index = new Map<string, HistoryEntryView[]>();
  for (const entry of entries) {
    const key = entry.seasonId ?? earlierKey;
    const bucket = index.get(key);
    const view = buildHistoryEntryView(t, locale, entry, resolvers);
    if (bucket === undefined) {
      const views = [view];
      index.set(key, views);
      seasons.push({ key, views });
    } else {
      bucket.push(view);
    }
  }
  return seasons.map(({ key, views }) => ({
    key,
    heading:
      key === earlierKey
        ? t(I18N_KEYS.standings.historyEarlierSeason)
        : (resolvers.seasonName(key) ?? t(I18N_KEYS.standings.historyEarlierSeason)),
    entries: views,
  }));
}

/** Everything the trophy cabinet needs, assembled once. */
export interface TeamHistoryDeps {
  readonly context: {
    readonly isOffline: boolean;
    readonly isLoading: boolean;
    readonly canReadHistory: boolean;
    readonly canManage: boolean;
  };
  readonly pageQuery: RemoteQueryView<TeamHistoryPage>;
  readonly locale: string;
  readonly entries: readonly TeamHistoryEntry[];
  readonly total: number;
  readonly hasMore: boolean;
  readonly categoryValue: string;
  readonly resolvers: HistoryNameResolvers;
  readonly onCategoryChange: (value: string) => void;
  readonly onLoadMore: () => void;
  readonly onOpenManage: () => void;
}

export function buildTeamHistoryScreenView(
  t: Translate,
  deps: TeamHistoryDeps,
): TeamHistoryScreenView {
  return {
    ...buildStandingsScreenCopy(t, {
      error: deps.pageQuery.error,
      isOffline: deps.context.isOffline,
      onRetry: deps.pageQuery.refetch,
      emptyTitleKey: I18N_KEYS.standings.historyEmptyTitle,
      emptyMessageKey: I18N_KEYS.standings.historyEmptyMessage,
    }),
    status: resolveScreenStatus(
      deps.context,
      deps.pageQuery,
      deps.context.canReadHistory,
      deps.entries.length > 0,
    ),
    title: t(I18N_KEYS.standings.historyTitle),
    subtitle: t(I18N_KEYS.standings.historySubtitle),
    categoryFilterLabel: t(I18N_KEYS.standings.historyCategoryFilterLabel),
    categoryFilterValue: deps.categoryValue,
    categoryFilterOptions: buildHistoryCategoryOptions(t),
    onCategoryFilterChange: deps.onCategoryChange,
    seasons: buildHistorySeasons(t, deps.locale, deps.entries, deps.resolvers),
    countLabel: t(I18N_KEYS.standings.historyEntryCount, {
      shown: String(deps.entries.length),
      total: String(deps.total),
    }),
    loadMoreLabel: deps.hasMore ? t(I18N_KEYS.standings.historyLoadMore) : null,
    onLoadMore: deps.onLoadMore,
    manageLink: deps.context.canManage ? t(I18N_KEYS.standings.historyEmptyManageLink) : null,
    onOpenManage: deps.onOpenManage,
  };
}
