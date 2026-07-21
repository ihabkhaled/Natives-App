import { I18N_KEYS } from '@/shared/i18n';

import { MATCH_STATUS, SCOREKEEPER_QUEUE_STATE } from './matches.constants';
import type {
  MatchCap,
  MatchEventType,
  MatchResult,
  ScorekeeperOperationKind,
} from '../types/matches.types';
import type { MatchStatus, ScorekeeperQueueState } from './matches.constants';

/** The five designed states of the match list, in one namespace. */
export const MATCHES_COPY_NAMESPACE = {
  loadingLabel: I18N_KEYS.matches.loadingLabel,
  errorTitle: I18N_KEYS.matches.errorTitle,
  errorMessage: I18N_KEYS.matches.errorMessage,
  retry: I18N_KEYS.matches.retry,
  offlineTitle: I18N_KEYS.matches.offlineTitle,
  offlineMessage: I18N_KEYS.matches.offlineMessage,
  forbiddenTitle: I18N_KEYS.matches.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.matches.forbiddenMessage,
} as const;

export const SCOREBOARD_COPY_NAMESPACE = {
  loadingLabel: I18N_KEYS.scoreboard.loadingLabel,
  errorTitle: I18N_KEYS.scoreboard.errorTitle,
  errorMessage: I18N_KEYS.scoreboard.errorMessage,
  retry: I18N_KEYS.scoreboard.retry,
  offlineTitle: I18N_KEYS.scoreboard.offlineTitle,
  offlineMessage: I18N_KEYS.scoreboard.offlineMessage,
  forbiddenTitle: I18N_KEYS.scoreboard.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.scoreboard.forbiddenMessage,
} as const;

export const MATCH_STATS_COPY_NAMESPACE = {
  loadingLabel: I18N_KEYS.matchStats.loadingLabel,
  errorTitle: I18N_KEYS.matchStats.errorTitle,
  errorMessage: I18N_KEYS.matchStats.errorMessage,
  retry: I18N_KEYS.matchStats.retry,
  offlineTitle: I18N_KEYS.matchStats.offlineTitle,
  offlineMessage: I18N_KEYS.matchStats.offlineMessage,
  forbiddenTitle: I18N_KEYS.matchStats.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.matchStats.forbiddenMessage,
} as const;

export const MATCH_STATUS_LABEL_KEYS: Record<MatchStatus, string> = {
  [MATCH_STATUS.Scheduled]: I18N_KEYS.matches.statusScheduled,
  [MATCH_STATUS.Ready]: I18N_KEYS.matches.statusReady,
  [MATCH_STATUS.Live]: I18N_KEYS.matches.statusLive,
  [MATCH_STATUS.Paused]: I18N_KEYS.matches.statusPaused,
  [MATCH_STATUS.Halftime]: I18N_KEYS.matches.statusHalftime,
  [MATCH_STATUS.Completed]: I18N_KEYS.matches.statusCompleted,
  [MATCH_STATUS.Finalized]: I18N_KEYS.matches.statusFinalized,
  [MATCH_STATUS.Abandoned]: I18N_KEYS.matches.statusAbandoned,
};

/** Ionic colour tokens only; gold stays reserved for achievements. */
export const MATCH_STATUS_TONES: Record<MatchStatus, string> = {
  [MATCH_STATUS.Scheduled]: 'medium',
  [MATCH_STATUS.Ready]: 'secondary',
  [MATCH_STATUS.Live]: 'success',
  [MATCH_STATUS.Paused]: 'warning',
  [MATCH_STATUS.Halftime]: 'warning',
  [MATCH_STATUS.Completed]: 'secondary',
  [MATCH_STATUS.Finalized]: 'success',
  [MATCH_STATUS.Abandoned]: 'danger',
};

export const MATCH_RESULT_LABEL_KEYS: Record<MatchResult, string> = {
  win: I18N_KEYS.matches.resultWin,
  loss: I18N_KEYS.matches.resultLoss,
  draw: I18N_KEYS.matches.resultDraw,
  undecided: I18N_KEYS.matches.resultUndecided,
};

export const MATCH_CAP_LABEL_KEYS: Record<MatchCap, string> = {
  none: I18N_KEYS.scoreboard.capNone,
  soft: I18N_KEYS.scoreboard.capSoft,
  hard: I18N_KEYS.scoreboard.capHard,
  time: I18N_KEYS.scoreboard.capTime,
};

export const MATCH_EVENT_LABEL_KEYS: Record<MatchEventType, string> = {
  point: I18N_KEYS.scoreboard.timelinePoint,
  timeout: I18N_KEYS.scoreboard.timelineTimeout,
  void: I18N_KEYS.scoreboard.timelineVoid,
  period_start: I18N_KEYS.scoreboard.timelinePeriodStart,
  period_end: I18N_KEYS.scoreboard.timelinePeriodEnd,
  cap_applied: I18N_KEYS.scoreboard.timelineCap,
};

export const QUEUE_STATE_LABEL_KEYS: Record<ScorekeeperQueueState, string> = {
  [SCOREKEEPER_QUEUE_STATE.Pending]: I18N_KEYS.scorekeeperQueue.statePending,
  [SCOREKEEPER_QUEUE_STATE.Retrying]: I18N_KEYS.scorekeeperQueue.stateRetrying,
  [SCOREKEEPER_QUEUE_STATE.Conflict]: I18N_KEYS.scorekeeperQueue.stateConflict,
  [SCOREKEEPER_QUEUE_STATE.Failed]: I18N_KEYS.scorekeeperQueue.stateFailed,
};

export const QUEUE_STATE_TONES: Record<ScorekeeperQueueState, string> = {
  [SCOREKEEPER_QUEUE_STATE.Pending]: 'secondary',
  [SCOREKEEPER_QUEUE_STATE.Retrying]: 'primary',
  [SCOREKEEPER_QUEUE_STATE.Conflict]: 'danger',
  [SCOREKEEPER_QUEUE_STATE.Failed]: 'warning',
};

export const QUEUE_KIND_LABEL_KEYS: Record<ScorekeeperOperationKind, string> = {
  point: I18N_KEYS.scorekeeperQueue.operationPoint,
  timeout: I18N_KEYS.scorekeeperQueue.operationTimeout,
  void: I18N_KEYS.scorekeeperQueue.operationVoid,
};
