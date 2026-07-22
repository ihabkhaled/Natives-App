import type { TranslateParams } from '@/packages/i18n';
import { formatNumber } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';

import { ALL_CATEGORIES } from '../constants/points-filter.constants';
import {
  COHORT_LABEL_KEYS,
  LEADERBOARD_COHORTS,
  LEADERBOARD_PERIODS,
  MOVEMENT_GLYPHS,
  MOVEMENT_LABEL_KEYS,
  MOVEMENT_TONES,
  PERIOD_LABEL_KEYS,
  RANK_MOVEMENT,
  TIE_MODE_LABEL_KEYS,
  type TieMode,
} from '../constants/points.constants';
import type {
  LeaderboardRowView,
  PointsOption,
  RankExplanationRowView,
  RankExplanationView,
} from '../types/points-view.types';
import type { LeaderboardRow } from '../types/points.types';

type Translate = (key: string, params?: TranslateParams) => string;

export function buildPeriodOptions(t: Translate): readonly PointsOption[] {
  return LEADERBOARD_PERIODS.map((period) => ({
    value: period,
    label: t(PERIOD_LABEL_KEYS[period]),
  }));
}

export function buildCohortOptions(t: Translate): readonly PointsOption[] {
  return LEADERBOARD_COHORTS.map((cohort) => ({
    value: cohort,
    label: t(COHORT_LABEL_KEYS[cohort]),
  }));
}

/** Category filter options derived from the contributions the server sent. */
export function buildCategoryOptions(
  t: Translate,
  rows: readonly LeaderboardRow[],
): readonly PointsOption[] {
  const categories = [
    ...new Set(rows.flatMap((row) => row.contributions.map((item) => item.category))),
  ].sort((left, right) => left.localeCompare(right));
  return [
    { value: ALL_CATEGORIES, label: t(I18N_KEYS.points.categoryAll) },
    ...categories.map((category) => ({ value: category, label: category })),
  ];
}

export function buildTieRuleLabel(t: Translate, tieMode: TieMode): string {
  return t(TIE_MODE_LABEL_KEYS[tieMode]);
}

/**
 * A row is displayed as tied when another row shares its exact server rank.
 * The client never re-orders or re-breaks a tie; it only labels the fact so
 * the displayed rule and the displayed ranks agree.
 */
function findTiedRanks(rows: readonly LeaderboardRow[]): ReadonlySet<number> {
  const counts = new Map<number, number>();
  for (const row of rows) {
    counts.set(row.rank, (counts.get(row.rank) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([rank]) => rank));
}

function buildMovementDetail(t: Translate, row: LeaderboardRow): string {
  if (row.previousRank === null) {
    return t(I18N_KEYS.points.previousRankUnknown);
  }
  if (row.rankDelta === null || row.movement === RANK_MOVEMENT.steady) {
    return t(I18N_KEYS.points.previousRank, { rank: row.previousRank });
  }
  return t(I18N_KEYS.points.movementDelta, { count: Math.abs(row.rankDelta) });
}

function buildExplanationRows(
  row: LeaderboardRow,
  locale: string,
): readonly RankExplanationRowView[] {
  return row.contributions.map((contribution) => ({
    key: contribution.category,
    category: contribution.category,
    pointsText: formatNumber(contribution.points, locale),
  }));
}

/**
 * The per-row "how this rank was calculated" panel: the contributing sums the
 * server reported plus the rule version it applied. No client formula.
 */
function buildRankExplanation(
  t: Translate,
  locale: string,
  row: LeaderboardRow,
  ruleVersion: number | null,
): RankExplanationView {
  return {
    heading: t(I18N_KEYS.points.explainHeading),
    intro: t(I18N_KEYS.points.explainIntro),
    categoryColumn: t(I18N_KEYS.points.explainCategory),
    pointsColumn: t(I18N_KEYS.points.explainPoints),
    rows: buildExplanationRows(row, locale),
    totalLabel: t(I18N_KEYS.points.explainTotal),
    totalText: formatNumber(row.total, locale),
    ruleVersionLabel:
      ruleVersion === null
        ? t(I18N_KEYS.points.explainRuleVersionUnknown)
        : t(I18N_KEYS.points.explainRuleVersion, { version: ruleVersion }),
    emptyLabel: t(I18N_KEYS.points.explainNoContributions),
    serverNotice: t(I18N_KEYS.points.explainServerNotice),
  };
}

export interface LeaderboardRowInput {
  readonly rows: readonly LeaderboardRow[];
  readonly expandedId: string;
  readonly ruleVersion: number | null;
}

/**
 * Build every row view. Zero-total members are kept and marked `isZero` so
 * they render muted but present — they are never filtered off the board.
 */
export function buildLeaderboardRows(
  t: Translate,
  locale: string,
  input: LeaderboardRowInput,
): readonly LeaderboardRowView[] {
  const tied = findTiedRanks(input.rows);
  return input.rows.map((row) => ({
    membershipId: row.membershipId,
    rankText: formatNumber(row.rank, locale),
    memberLabel: row.membershipId,
    totalText: formatNumber(row.total, locale),
    isZero: row.total === 0,
    isTied: tied.has(row.rank),
    tiedLabel: tied.has(row.rank) ? t(I18N_KEYS.points.tiedWith) : null,
    movementGlyph: MOVEMENT_GLYPHS[row.movement],
    movementLabel: t(MOVEMENT_LABEL_KEYS[row.movement]),
    movementTone: MOVEMENT_TONES[row.movement],
    movementDetail: buildMovementDetail(t, row),
    badgeCountLabel:
      row.badgeCount === 0 ? null : t(I18N_KEYS.points.badgeCountLabel, { count: row.badgeCount }),
    isExpanded: row.membershipId === input.expandedId,
    explainLabel: t(I18N_KEYS.points.explainToggle),
    explanation: buildRankExplanation(t, locale, row, input.ruleVersion),
  }));
}
