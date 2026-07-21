import { I18N_KEYS } from '@/shared/i18n';
import type { AsyncViewStatus } from '@/shared/ui';

import { MATCH_STATS_COPY_NAMESPACE } from '../constants/matches-labels.constants';
import { buildMatchesScreenCopy } from './matches-copy.helper';
import {
  buildChartBars,
  buildChartRows,
  buildDerivationFacts,
  buildGlossaryFacts,
  buildTeamFacts,
} from './match-statistics-view.helper';
import { buildPlayerReport } from './player-report.helper';
import { buildPlayerStatRow, sortPlayerRows } from './player-stat-row.helper';
import type { AppError } from '@/shared/errors/app.errors';
import type { MatchStatistics } from '../types/matches.types';
import type { ChartBarView, MatchStatisticsScreenView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface MatchStatisticsViewInput {
  readonly statistics: MatchStatistics;
  readonly resolveName: (membershipId: string) => string;
  readonly status: AsyncViewStatus;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly openReportMembershipId: string | null;
  readonly onRetry: () => void;
  readonly onBack: () => void;
  readonly onOpenReport: (membershipId: string) => void;
  readonly onCloseReport: () => void;
}

const PLAYER_COLUMN_KEYS = [
  I18N_KEYS.matchStats.playerColumn,
  I18N_KEYS.matchStats.pointsPlayed,
  I18N_KEYS.matchStats.offencePoints,
  I18N_KEYS.matchStats.defencePoints,
  I18N_KEYS.matchStats.goals,
  I18N_KEYS.matchStats.assists,
  I18N_KEYS.matchStats.drops,
  I18N_KEYS.matchStats.throwaways,
  I18N_KEYS.matchStats.blocks,
] as const;

function selectedReport(t: Translate, input: MatchStatisticsViewInput) {
  const player = input.statistics.players.find(
    (candidate) => candidate.membershipId === input.openReportMembershipId,
  );
  return player === undefined
    ? null
    : buildPlayerReport(t, player, input.resolveName(player.membershipId));
}

function buildChartSection(t: Translate, bars: readonly ChartBarView[]) {
  return {
    chartHeading: t(I18N_KEYS.matchStats.chartHeading),
    chartCaption: t(I18N_KEYS.matchStats.chartCaption),
    chartToggle: t(I18N_KEYS.matchStats.chartToggle),
    chartColumns: [
      t(I18N_KEYS.matchStats.chartColumnMeasure),
      t(I18N_KEYS.matchStats.chartColumnValue),
    ],
    chartRows: buildChartRows(bars),
    chartBars: bars,
  };
}

function buildReferenceSections(t: Translate, statistics: MatchStatistics) {
  return {
    glossaryHeading: t(I18N_KEYS.matchStats.glossaryPanel),
    glossaryIntro: t(I18N_KEYS.matchStats.glossaryIntro),
    glossary: buildGlossaryFacts(t),
    derivationHeading: t(I18N_KEYS.matchStats.derivationPanel),
    derivationIntro: t(I18N_KEYS.matchStats.derivationIntro),
    derivation: buildDerivationFacts(t, statistics),
    // The backend ships no clip, timestamp, or tag endpoint yet. This surface
    // says so rather than rendering invented analysis.
    video: {
      heading: t(I18N_KEYS.matchStats.videoPanel),
      title: t(I18N_KEYS.matchStats.videoUnavailableTitle),
      message: t(I18N_KEYS.matchStats.videoUnavailableMessage),
      deferredNote: t(I18N_KEYS.matchStats.videoDeferred),
    },
  };
}

/**
 * The statistics view model.
 *
 * Every player the projection returns is rendered — a rostered player with an
 * all-zero line included — because the roster-completeness guarantee is the
 * point of this table. Missing measures stay null all the way here and print
 * "not enough data" rather than a fabricated zero.
 */
export function buildMatchStatisticsView(
  t: Translate,
  input: MatchStatisticsViewInput,
): MatchStatisticsScreenView {
  const statistics = input.statistics;
  const bars = buildChartBars(t, statistics.team);
  const rows = sortPlayerRows(
    statistics.players.map((player) => buildPlayerStatRow(t, player, input.resolveName)),
  );
  const incomplete = !statistics.lineupsRecorded || !statistics.playsRecorded;
  return {
    ...buildMatchesScreenCopy(t, {
      namespace: MATCH_STATS_COPY_NAMESPACE,
      error: input.error,
      isOffline: input.isOffline,
      onRetry: input.onRetry,
      emptyTitleKey: I18N_KEYS.matchStats.emptyTitle,
      emptyMessageKey: I18N_KEYS.matchStats.emptyMessage,
    }),
    ...buildReferenceSections(t, statistics),
    ...buildChartSection(t, bars),
    title: t(I18N_KEYS.matchStats.title),
    heading: t(I18N_KEYS.matchStats.heading),
    subtitle: t(I18N_KEYS.matchStats.subtitle),
    backLabel: t(I18N_KEYS.matches.back),
    status: input.status,
    teamHeading: t(I18N_KEYS.matchStats.teamPanel),
    teamIntro: t(I18N_KEYS.matchStats.teamIntro),
    teamFacts: buildTeamFacts(t, statistics.team),
    playersHeading: t(I18N_KEYS.matchStats.playersPanel),
    playersIntro: t(I18N_KEYS.matchStats.playersIntro),
    playersCaption: t(I18N_KEYS.matchStats.playersCaption),
    playerCountLabel: t(I18N_KEYS.matchStats.playerCount, { count: rows.length }),
    playerColumns: PLAYER_COLUMN_KEYS.map((key) => t(key)),
    playerRows: rows,
    incompleteNotice: incomplete ? t(I18N_KEYS.matchStats.incompleteNotice) : null,
    report: selectedReport(t, input),
    reportHeading: t(I18N_KEYS.matchStats.reportPanel),
    reportIntro: t(I18N_KEYS.matchStats.reportIntro),
    onBack: input.onBack,
    onOpenReport: input.onOpenReport,
    onCloseReport: input.onCloseReport,
  };
}
