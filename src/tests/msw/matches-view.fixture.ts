import { buildMatchEvent } from './matches-domain.fixture';

/** A resolved, fully-granted match context for view-model tests. */
export const MATCH_CONTEXT_STUB = {
  teamId: 'team-natives',
  userId: 'user-1',
  isOffline: false,
  canReadMatches: true,
  canScoreMatch: true,
  canFinalizeMatch: true,
  canReadStatistics: true,
  canReadAnalysis: true,
  isLoading: false,
} as const;

/** A settled remote read that produced nothing. */
export function buildEmptyRemoteQuery(noop: () => void) {
  return { data: undefined, isLoading: false, error: null, refetch: noop };
}

/** The undo/timeline panel input, with every callback supplied by the caller. */
export function buildTimelineInput(noop: () => void) {
  return {
    events: [buildMatchEvent()],
    undoableEventId: 'event-1',
    canScore: true,
    hasQueuedWork: false,
    isUndoOpen: false,
    isUndoRunning: false,
    undoReason: '',
    onUndoOpen: noop,
    onUndoCancel: noop,
    onUndoReasonChange: noop,
    onUndoConfirm: noop,
  };
}

/** The sync-panel input for a queue with nothing waiting. */
export function buildIdleQueueInput(noop: () => void) {
  return {
    operations: [],
    conflicts: [],
    pendingCount: 0,
    isOffline: false,
    isReplaying: false,
    isAtLimit: false,
    hasForeignQueue: false,
    hasFailed: false,
    onRetryFailed: noop,
    onDiscardConflict: noop,
    onReloadAuthoritative: noop,
  };
}
