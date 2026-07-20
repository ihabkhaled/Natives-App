import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ALL_CATEGORIES } from '../constants/points-filter.constants';
import type { LeaderboardChrome, PointsOption } from '../types/points-view.types';
import type { Leaderboard, LeaderboardFilters } from '../types/points.types';
import { buildCategoryOptions, buildTieRuleLabel } from './leaderboard-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

export interface LeaderboardChromeInput {
  readonly board: Leaderboard | null;
  readonly filters: LeaderboardFilters;
  readonly locale: string;
  readonly periodOptions: readonly PointsOption[];
  readonly cohortOptions: readonly PointsOption[];
}

/**
 * The board's headline chrome: filter values, freshness, the count, and the
 * tie-break rule the server actually applied — stated, never re-derived.
 */
export function buildLeaderboardChrome(
  t: Translate,
  input: LeaderboardChromeInput,
): LeaderboardChrome {
  const rows = input.board?.rows ?? [];
  return {
    filtersHeading: t(I18N_KEYS.points.filtersHeading),
    periodLabel: t(I18N_KEYS.points.periodLabel),
    periodValue: input.filters.period,
    periodOptions: input.periodOptions,
    cohortLabel: t(I18N_KEYS.points.cohortLabel),
    cohortValue: input.filters.cohort,
    cohortOptions: input.cohortOptions,
    categoryLabel: t(I18N_KEYS.points.categoryLabel),
    categoryValue: input.filters.category ?? ALL_CATEGORIES,
    categoryOptions: buildCategoryOptions(t, rows),
    freshnessLabel:
      input.board === null
        ? ''
        : t(I18N_KEYS.points.freshnessLabel, {
            when: formatCairoDateTime(input.board.asOfIso, input.locale),
          }),
    countLabel: t(I18N_KEYS.points.resultCount, {
      shown: rows.length,
      total: input.board?.total ?? rows.length,
    }),
    tieRuleHeading: t(I18N_KEYS.points.tieRuleHeading),
    tieRuleLabel: input.board === null ? '' : buildTieRuleLabel(t, input.board.tieMode),
    tieRuleNotice: t(I18N_KEYS.points.tieBreakNotice),
    zeroNotice: t(I18N_KEYS.points.zeroNotice),
    tableCaption: t(I18N_KEYS.points.tableCaption),
    columnRank: t(I18N_KEYS.points.columnRank),
    columnMember: t(I18N_KEYS.points.columnMember),
    columnTotal: t(I18N_KEYS.points.columnTotal),
    columnMovement: t(I18N_KEYS.points.columnMovement),
    columnBadges: t(I18N_KEYS.points.columnBadges),
  };
}
