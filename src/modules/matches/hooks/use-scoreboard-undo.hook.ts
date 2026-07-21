import { useState } from 'react';

import { isCorrectionReasonValid } from '../helpers/timeline-panel.helper';
import type { TimelinePanelInput } from '../helpers/timeline-panel.helper';
import type { MatchEvent } from '../types/matches.types';

export interface ScoreboardUndoScope {
  readonly events: readonly MatchEvent[];
  readonly undoableEvent: MatchEvent | null;
  readonly canScore: boolean;
  readonly hasQueuedWork: boolean;
  readonly isRunning: boolean;
  readonly onCorrect: (eventId: string, reason: string) => void;
}

/**
 * The undo dialog's own state.
 *
 * Confirming appends a compensating correction carrying the typed reason; the
 * original point is never rewritten. A reason shorter than the backend minimum
 * simply does not submit, so the operator is not handed a 400.
 */
export function useScoreboardUndo(scope: ScoreboardUndoScope): TimelinePanelInput {
  const [undoState, setUndoState] = useState({ isOpen: false, reason: '' });
  return {
    events: scope.events,
    undoableEventId: scope.undoableEvent?.eventId ?? null,
    canScore: scope.canScore,
    hasQueuedWork: scope.hasQueuedWork,
    isUndoOpen: undoState.isOpen,
    isUndoRunning: scope.isRunning,
    undoReason: undoState.reason,
    onUndoOpen: () => {
      setUndoState({ isOpen: true, reason: '' });
    },
    onUndoCancel: () => {
      setUndoState({ isOpen: false, reason: '' });
    },
    onUndoReasonChange: (reason: string) => {
      setUndoState((current) => ({ ...current, reason }));
    },
    onUndoConfirm: () => {
      const target = scope.undoableEvent;
      if (target === null || !isCorrectionReasonValid(undoState.reason)) {
        return;
      }
      scope.onCorrect(target.eventId, undoState.reason.trim());
      setUndoState({ isOpen: false, reason: '' });
    },
  };
}
