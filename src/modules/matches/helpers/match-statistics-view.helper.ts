import { I18N_KEYS } from '@/shared/i18n';
import type { ChartTableRow, FactListItem } from '@/shared/ui';

import { formatStatValue } from './player-stat-row.helper';
import type { MatchStatistics, TeamMatchStatistics } from '../types/matches.types';
import type { ChartBarView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/** A rate over zero points played is unknown, not 0%. */
function rate(numerator: number, denominator: number): string | null {
  return denominator === 0 ? null : `${String(Math.round((numerator / denominator) * 100))}%`;
}

function rateValue(t: Translate, numerator: number, denominator: number): string {
  return rate(numerator, denominator) ?? t(I18N_KEYS.matchStats.notEnoughData);
}

/** Counted measures the projection always reports. */
const COUNTED_TEAM_MEASURES = [
  { key: 'goalsFor', labelKey: I18N_KEYS.matchStats.goalsFor },
  { key: 'goalsAgainst', labelKey: I18N_KEYS.matchStats.goalsAgainst },
  { key: 'pointsStarted', labelKey: I18N_KEYS.matchStats.pointsStarted },
  { key: 'pointsCompleted', labelKey: I18N_KEYS.matchStats.pointsCompleted },
  { key: 'holds', labelKey: I18N_KEYS.matchStats.holds },
  { key: 'breaks', labelKey: I18N_KEYS.matchStats.breaks },
  { key: 'opponentHolds', labelKey: I18N_KEYS.matchStats.opponentHolds },
  { key: 'opponentBreaks', labelKey: I18N_KEYS.matchStats.opponentBreaks },
] as const;

/** Measures the stream may not support; these stay nullable to the very end. */
const NULLABLE_TEAM_MEASURES = [
  { key: 'turnovers', labelKey: I18N_KEYS.matchStats.turnovers },
  { key: 'opponentErrors', labelKey: I18N_KEYS.matchStats.opponentErrors },
] as const;

export function buildTeamFacts(t: Translate, team: TeamMatchStatistics): readonly FactListItem[] {
  return [
    ...COUNTED_TEAM_MEASURES.map((measure) => ({
      key: measure.key,
      label: t(measure.labelKey),
      value: String(team[measure.key]),
    })),
    ...NULLABLE_TEAM_MEASURES.map((measure) => ({
      key: measure.key,
      label: t(measure.labelKey),
      value: formatStatValue(t, team[measure.key]),
    })),
    {
      key: 'holdRate',
      label: t(I18N_KEYS.matchStats.holdRate),
      value: rateValue(t, team.holds, team.pointsCompleted),
    },
    {
      key: 'breakRate',
      label: t(I18N_KEYS.matchStats.breakRate),
      value: rateValue(t, team.breaks, team.pointsCompleted),
    },
  ];
}

const CHART_MEASURES = [
  { key: 'holds', labelKey: I18N_KEYS.matchStats.holds },
  { key: 'breaks', labelKey: I18N_KEYS.matchStats.breaks },
  { key: 'opponentHolds', labelKey: I18N_KEYS.matchStats.opponentHolds },
  { key: 'opponentBreaks', labelKey: I18N_KEYS.matchStats.opponentBreaks },
] as const;

/** Bars and their accessible tabular alternative share one source of truth. */
export function buildChartBars(t: Translate, team: TeamMatchStatistics): readonly ChartBarView[] {
  // A match with nothing recorded divides by 1, so every bar reads 0% rather
  // than NaN.
  const highest = Math.max(...CHART_MEASURES.map((measure) => team[measure.key]), 1);
  return CHART_MEASURES.map((measure) => ({
    key: measure.key,
    label: t(measure.labelKey),
    valueText: String(team[measure.key]),
    percent: Math.round((team[measure.key] / highest) * 100),
  }));
}

export function buildChartRows(bars: readonly ChartBarView[]): readonly ChartTableRow[] {
  return bars.map((bar) => ({ key: bar.key, label: bar.label, valueText: bar.valueText }));
}

/**
 * How the numbers were produced, and honestly what was missing. When lineups
 * or plays were never recorded, the per-player table reads "not enough data"
 * and this panel says why.
 */
export function buildDerivationFacts(
  t: Translate,
  statistics: MatchStatistics,
): readonly FactListItem[] {
  const recorded = (flag: boolean): string =>
    t(flag ? I18N_KEYS.matchStats.derivationRecorded : I18N_KEYS.matchStats.derivationNotRecorded);
  return [
    {
      key: 'engine',
      label: t(I18N_KEYS.matchStats.derivationEngine),
      value: statistics.statsEngineVersion,
    },
    {
      key: 'ruleset',
      label: t(I18N_KEYS.matchStats.derivationRuleset),
      value: `${statistics.rulesetKey} v${String(statistics.rulesetVersion)}`,
    },
    {
      key: 'lineups',
      label: t(I18N_KEYS.matchStats.derivationLineups),
      value: recorded(statistics.lineupsRecorded),
    },
    {
      key: 'plays',
      label: t(I18N_KEYS.matchStats.derivationPlays),
      value: recorded(statistics.playsRecorded),
    },
    {
      key: 'attribution',
      label: t(I18N_KEYS.matchStats.derivationAttribution),
      value: recorded(statistics.opponentErrorAttribution),
    },
  ];
}

export function buildGlossaryFacts(t: Translate): readonly FactListItem[] {
  return [
    {
      key: 'pointsPlayed',
      label: t(I18N_KEYS.matchStats.pointsPlayed),
      value: t(I18N_KEYS.matchStats.glossaryPointsPlayed),
    },
    {
      key: 'holds',
      label: t(I18N_KEYS.matchStats.holds),
      value: t(I18N_KEYS.matchStats.glossaryHold),
    },
    {
      key: 'breaks',
      label: t(I18N_KEYS.matchStats.breaks),
      value: t(I18N_KEYS.matchStats.glossaryBreak),
    },
    {
      key: 'blocks',
      label: t(I18N_KEYS.matchStats.blocks),
      value: t(I18N_KEYS.matchStats.glossaryBlock),
    },
    {
      key: 'throwaways',
      label: t(I18N_KEYS.matchStats.throwaways),
      value: t(I18N_KEYS.matchStats.glossaryThrowaway),
    },
    {
      key: 'drops',
      label: t(I18N_KEYS.matchStats.drops),
      value: t(I18N_KEYS.matchStats.glossaryDrop),
    },
  ];
}
