import { I18N_KEYS } from '@/shared/i18n';

import {
  MATCH_CAP_LABEL_KEYS,
  MATCH_STATUS_LABEL_KEYS,
  MATCH_STATUS_TONES,
} from '../constants/matches-labels.constants';
import type { MatchRuleset, MatchScoreboard } from '../types/matches.types';
import type { ScoreboardHeadView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * The big legible score. The numbers are the server's, never a locally
 * incremented counter: a queued point shows as pending in the sync panel and
 * only moves the score once the stream confirms it.
 */
export function buildScoreboardHead(
  t: Translate,
  scoreboard: MatchScoreboard,
  ruleset: MatchRuleset | null,
): ScoreboardHeadView {
  const statusLabel = t(MATCH_STATUS_LABEL_KEYS[scoreboard.status]);
  return {
    usLabel: t(I18N_KEYS.scoreboard.usLabel),
    themLabel: t(I18N_KEYS.scoreboard.themLabel),
    ourScore: String(scoreboard.ourScore),
    theirScore: String(scoreboard.opponentScore),
    statusLabel,
    statusTone: MATCH_STATUS_TONES[scoreboard.status],
    periodLabel: t(I18N_KEYS.scoreboard.periodLabel, {
      period: scoreboard.period,
      periods: ruleset?.periods ?? scoreboard.period,
    }),
    capLabel: t(I18N_KEYS.scoreboard.capApplied),
    capValue: t(MATCH_CAP_LABEL_KEYS[scoreboard.capApplied]),
    liveRegionLabel: t(I18N_KEYS.scoreboard.liveRegionLabel),
    announcement: t(I18N_KEYS.scoreboard.scoreAnnouncement, {
      us: scoreboard.ourScore,
      them: scoreboard.opponentScore,
      status: statusLabel,
    }),
  };
}
