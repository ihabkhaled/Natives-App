import { formatCairoDate, formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { formatSignedNumber } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';
import type { ChartTableRow } from '@/shared/ui';

import {
  BADGE_CANDIDATE_THRESHOLDS,
  LEADERBOARD_LIMITS,
  LEDGER_ENTRY_LABEL_KEYS,
  LEDGER_ENTRY_TONES,
  LEDGER_SOURCE_LABEL_KEYS,
} from '../constants/points.constants';
import type {
  BadgeCandidateView,
  BadgeView,
  LedgerEntryView,
  PointsCategoryChartBarView,
  PointsCategoryChartView,
} from '../types/points-view.types';
import type { LedgerEntry, PlayerBadge } from '../types/points.types';

type Translate = (key: string, params?: TranslateParams) => string;

/**
 * Every ledger entry is its own row. A reversal or an adjustment never edits
 * an earlier entry — it appears alongside it, which is exactly what the
 * append-only notice above the list states.
 */
export function buildLedgerEntries(
  t: Translate,
  locale: string,
  entries: readonly LedgerEntry[],
): readonly LedgerEntryView[] {
  return entries.map((entry) => ({
    id: entry.id,
    typeLabel: t(LEDGER_ENTRY_LABEL_KEYS[entry.entryType]),
    typeTone: LEDGER_ENTRY_TONES[entry.entryType],
    amountText: formatSignedNumber(entry.amount, locale),
    sourceLabel: t(LEDGER_SOURCE_LABEL_KEYS[entry.sourceType]),
    categoryLabel: entry.activityCategory,
    reasonText: entry.reason ?? t(I18N_KEYS.points.entryReasonEmpty),
    ruleVersionLabel:
      entry.ruleVersion === null
        ? t(I18N_KEYS.points.explainRuleVersionUnknown)
        : t(I18N_KEYS.points.explainRuleVersion, { version: entry.ruleVersion }),
    dateLabel: formatCairoDate(entry.effectiveOn, locale),
  }));
}

/** Only badges the server actually awarded. Nothing is inferred from a total. */
export function buildBadges(
  t: Translate,
  locale: string,
  badges: readonly PlayerBadge[],
): readonly BadgeView[] {
  return badges.map((badge) => ({
    badgeKey: badge.badgeKey,
    label: badge.badgeKey,
    thresholdLabel: t(I18N_KEYS.points.badgeThreshold, { points: badge.threshold }),
    pointsAtAwardLabel: t(I18N_KEYS.points.badgePointsAtAward, { points: badge.pointsAtAward }),
    awardedLabel: t(I18N_KEYS.points.badgeAwardedAt, {
      when: formatCairoDateTime(badge.awardedAtIso, locale),
    }),
  }));
}

/**
 * The published candidate thresholds a member has not been awarded yet. The
 * unresolved legacy tier is absent from the source list, so it can never be
 * shown; reaching a threshold reads "awaiting the server", never "earned".
 */
export function buildBadgeCandidates(
  t: Translate,
  total: number,
  badges: readonly PlayerBadge[],
): readonly BadgeCandidateView[] {
  const awarded = new Set(badges.map((badge) => badge.threshold));
  return BADGE_CANDIDATE_THRESHOLDS.filter((threshold) => !awarded.has(threshold)).map(
    (threshold) => ({
      key: String(threshold),
      thresholdLabel: t(I18N_KEYS.points.badgeThreshold, { points: threshold }),
      progressLabel:
        total >= threshold
          ? t(I18N_KEYS.points.badgeCandidateReached)
          : t(I18N_KEYS.points.badgeCandidateRemaining, { points: threshold - total }),
      isReached: total >= threshold,
    }),
  );
}

/** Sum the ledger per activity category; entries with no category are skipped. */
function summarizeByCategory(entries: readonly LedgerEntry[]): ReadonlyMap<string, number> {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    if (entry.activityCategory === null) {
      continue;
    }
    totals.set(entry.activityCategory, (totals.get(entry.activityCategory) ?? 0) + entry.amount);
  }
  return totals;
}

function buildBars(
  totals: ReadonlyMap<string, number>,
  locale: string,
): readonly PointsCategoryChartBarView[] {
  const rows = [...totals.entries()].sort((left, right) => right[1] - left[1]);
  const widest = Math.max(1, ...rows.map(([, value]) => Math.abs(value)));
  const { chartBarHeight, chartBarGap, chartWidth } = LEADERBOARD_LIMITS;
  return rows.map(([category, value], index) => {
    const y = index * (chartBarHeight + chartBarGap);
    return {
      key: category,
      label: category,
      valueText: formatSignedNumber(value, locale),
      x: 0,
      y,
      width: Math.max(2, Math.round((Math.abs(value) / widest) * chartWidth)),
      height: chartBarHeight,
      labelY: y + chartBarHeight / 2,
    };
  });
}

function buildTableRows(
  totals: ReadonlyMap<string, number>,
  locale: string,
): readonly ChartTableRow[] {
  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([category, value]) => ({
      key: category,
      label: category,
      valueText: formatSignedNumber(value, locale),
    }));
}

/**
 * In-house SVG bar chart of the points each category contributed, always
 * paired with the same numbers in a real table underneath it.
 */
export function buildCategoryChart(
  t: Translate,
  locale: string,
  entries: readonly LedgerEntry[],
): PointsCategoryChartView {
  const totals = summarizeByCategory(entries);
  const bars = buildBars(totals, locale);
  const { chartBarHeight, chartBarGap, chartWidth } = LEADERBOARD_LIMITS;
  const height = Math.max(chartBarHeight, bars.length * (chartBarHeight + chartBarGap));
  return {
    heading: t(I18N_KEYS.points.chartHeading),
    description: t(I18N_KEYS.points.chartDescription),
    emptyLabel: t(I18N_KEYS.points.chartEmpty),
    viewBox: `0 0 ${String(chartWidth)} ${String(height)}`,
    bars,
    tableToggleLabel: t(I18N_KEYS.points.chartTableToggle),
    tableCaption: t(I18N_KEYS.points.chartTableCaption),
    columnLabels: [t(I18N_KEYS.points.chartColumnCategory), t(I18N_KEYS.points.chartColumnPoints)],
    tableRows: buildTableRows(totals, locale),
  };
}
