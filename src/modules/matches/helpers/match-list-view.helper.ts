import type { SelectFieldOption } from '@/shared/ui';
import { I18N_KEYS } from '@/shared/i18n';

import {
  MATCH_RESULT_LABEL_KEYS,
  MATCH_STATUS_LABEL_KEYS,
  MATCH_STATUS_TONES,
} from '../constants/matches-labels.constants';
import { MATCH_STATUS, MATCH_STATUSES } from '../constants/matches.constants';
import type { Match } from '../types/matches.types';
import type { MatchCardView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export const ALL_MATCH_FILTER = 'all';

export function matchesStatusFilter(status: string, filter: string): boolean {
  return filter === ALL_MATCH_FILTER || status === filter;
}

export function buildMatchStatusOptions(t: Translate): readonly SelectFieldOption[] {
  return [
    { value: ALL_MATCH_FILTER, label: t(I18N_KEYS.matches.filterAll) },
    ...MATCH_STATUSES.map((status) => ({
      value: status,
      label: t(MATCH_STATUS_LABEL_KEYS[status]),
    })),
  ];
}

/** Live, paused, and halftime all mean "a scorekeeper is on the field". */
export function isMatchInPlay(status: string): boolean {
  return (
    status === MATCH_STATUS.Live ||
    status === MATCH_STATUS.Paused ||
    status === MATCH_STATUS.Halftime
  );
}

export function buildMatchCard(t: Translate, match: Match): MatchCardView {
  return {
    id: match.matchId,
    title: t(MATCH_STATUS_LABEL_KEYS[match.status]),
    scoreLabel: t(I18N_KEYS.matches.cardScoreLabel, {
      us: match.ourScore,
      them: match.opponentScore,
    }),
    statusLabel: t(MATCH_STATUS_LABEL_KEYS[match.status]),
    statusTone: MATCH_STATUS_TONES[match.status],
    resultLabel: t(MATCH_RESULT_LABEL_KEYS[match.result]),
    homeAwayLabel: t(I18N_KEYS.matches.homeAway, { side: match.homeAway }),
    isLive: isMatchInPlay(match.status),
    openScoreboardLabel: t(I18N_KEYS.matches.openScoreboard),
    openStatisticsLabel: t(I18N_KEYS.matches.openStatistics),
  };
}
