import { I18N_KEYS } from '@/shared/i18n';

import { CORRECTION_REASON_MIN_LENGTH } from '../constants/matches.constants';
import { buildTimelineRows } from './match-timeline.helper';
import type { MatchEvent } from '../types/matches.types';
import type { TimelinePanelView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface TimelinePanelInput {
  readonly events: readonly MatchEvent[];
  readonly undoableEventId: string | null;
  readonly canScore: boolean;
  readonly hasQueuedWork: boolean;
  readonly isUndoOpen: boolean;
  readonly isUndoRunning: boolean;
  readonly undoReason: string;
  readonly onUndoOpen: () => void;
  readonly onUndoCancel: () => void;
  readonly onUndoReasonChange: (value: string) => void;
  readonly onUndoConfirm: () => void;
}

/**
 * The point timeline and its undo affordance.
 *
 * Undo is blocked while anything is still queued: correcting an event the
 * server has not seen yet would void the wrong sequence once the backlog
 * lands. The correction itself is an appended compensating event carrying the
 * operator's reason, never an edit of the original.
 */
export function buildTimelinePanel(t: Translate, input: TimelinePanelInput): TimelinePanelView {
  const blocked = input.hasQueuedWork;
  return {
    heading: t(I18N_KEYS.scoreboard.timelinePanel),
    intro: t(I18N_KEYS.scoreboard.timelineIntro),
    rows: buildTimelineRows(t, input.events),
    emptyLabel: t(I18N_KEYS.scoreboard.timelineEmpty),
    undoLabel: t(I18N_KEYS.scoreboard.undoLabel),
    undoDisabled: !input.canScore || blocked || input.undoableEventId === null,
    undoBlockedNotice: blocked ? t(I18N_KEYS.scoreboard.undoQueuedFirst) : null,
    undoReasonLabel: t(I18N_KEYS.scoreboard.undoReasonLabel),
    undoReason: input.undoReason,
    undoConfirmLabel: t(I18N_KEYS.scoreboard.undoConfirm),
    undoCancelLabel: t(I18N_KEYS.scoreboard.undoCancel),
    undoTitle: t(I18N_KEYS.scoreboard.undoTitle),
    undoMessage: t(I18N_KEYS.scoreboard.undoMessage),
    isUndoOpen: input.isUndoOpen,
    isUndoRunning: input.isUndoRunning,
    onUndoOpen: input.onUndoOpen,
    onUndoCancel: input.onUndoCancel,
    onUndoReasonChange: input.onUndoReasonChange,
    onUndoConfirm: input.onUndoConfirm,
  };
}

/** The backend rejects a reason shorter than its minimum; so does the button. */
export function isCorrectionReasonValid(reason: string): boolean {
  return reason.trim().length >= CORRECTION_REASON_MIN_LENGTH;
}
