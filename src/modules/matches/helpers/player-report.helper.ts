import { I18N_KEYS } from '@/shared/i18n';
import type { FactListItem } from '@/shared/ui';

import {
  formatStatValue,
  hasMissingMeasures,
  hasNoRecordedContribution,
} from './player-stat-row.helper';
import type { PlayerMatchStatistics } from '../types/matches.types';
import type { PlayerReportView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

const REPORT_MEASURES = [
  { key: 'pointsPlayed', labelKey: I18N_KEYS.matchStats.pointsPlayed },
  { key: 'offencePointsPlayed', labelKey: I18N_KEYS.matchStats.offencePoints },
  { key: 'defencePointsPlayed', labelKey: I18N_KEYS.matchStats.defencePoints },
  { key: 'goals', labelKey: I18N_KEYS.matchStats.goals },
  { key: 'assists', labelKey: I18N_KEYS.matchStats.assists },
  { key: 'callahans', labelKey: I18N_KEYS.matchStats.callahans },
  { key: 'drops', labelKey: I18N_KEYS.matchStats.drops },
  { key: 'throwaways', labelKey: I18N_KEYS.matchStats.throwaways },
  { key: 'blocks', labelKey: I18N_KEYS.matchStats.blocks },
] as const;

/**
 * One player's match report. A rostered player with an all-zero line still
 * gets a report, and it says so explicitly rather than looking like an error.
 */
export function buildPlayerReport(
  t: Translate,
  player: PlayerMatchStatistics,
  playerName: string,
): PlayerReportView {
  const facts: readonly FactListItem[] = REPORT_MEASURES.map((measure) => ({
    key: measure.key,
    label: t(measure.labelKey),
    value: formatStatValue(t, player[measure.key]),
  }));
  return {
    heading: t(I18N_KEYS.matchStats.reportHeading, { player: playerName }),
    facts,
    zeroNotice: hasNoRecordedContribution(player) ? t(I18N_KEYS.matchStats.reportZeroNotice) : null,
    missingNotice: hasMissingMeasures(player) ? t(I18N_KEYS.matchStats.reportMissingNotice) : null,
    closeLabel: t(I18N_KEYS.matchStats.reportClose),
  };
}
