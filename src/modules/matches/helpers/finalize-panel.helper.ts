import { I18N_KEYS } from '@/shared/i18n';

import { MATCH_STATUS } from '../constants/matches.constants';
import { evaluateFinalizeGuard } from './finalize-guard.helper';
import type { MatchScoreboard } from '../types/matches.types';
import type { FinalizePanelView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface FinalizePanelInput {
  readonly scoreboard: MatchScoreboard;
  readonly queuedCount: number;
  readonly lastKnownStreamVersion: number;
  readonly canFinalize: boolean;
  readonly isRunning: boolean;
  readonly onFinalize: () => void;
}

/**
 * The finalize panel states the exact reason it is blocked, because "the
 * button is grey" is not enough on a sideline: the operator needs to know
 * whether to reconnect, refresh, or finish the match first.
 */
export function buildFinalizePanel(t: Translate, input: FinalizePanelInput): FinalizePanelView {
  const guard = evaluateFinalizeGuard({
    status: input.scoreboard.status,
    queuedCount: input.queuedCount,
    scoreboardStreamVersion: input.scoreboard.streamVersion,
    lastKnownStreamVersion: input.lastKnownStreamVersion,
    canFinalize: input.canFinalize,
  });
  const isFinalized = input.scoreboard.status === MATCH_STATUS.Finalized;
  return {
    heading: t(I18N_KEYS.scoreboard.finalizePanel),
    intro: t(I18N_KEYS.scoreboard.finalizeIntro),
    actionLabel: t(I18N_KEYS.scoreboard.finalizeAction),
    disabled: !guard.allowed || isFinalized,
    isRunning: input.isRunning,
    statusNotice: t(
      isFinalized ? I18N_KEYS.scoreboard.finalizeDone : I18N_KEYS.scoreboard.finalizeReady,
    ),
    blockedNotice:
      guard.blockedKey === null ? null : t(guard.blockedKey, { count: input.queuedCount }),
    onFinalize: input.onFinalize,
  };
}
