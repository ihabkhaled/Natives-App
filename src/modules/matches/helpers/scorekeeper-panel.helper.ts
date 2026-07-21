import { I18N_KEYS } from '@/shared/i18n';

import {
  buildQueueBadge,
  buildQueueRows,
  formatConflictServerValue,
} from './scorekeeper-queue-view.helper';
import { describeScorekeeperPayload } from './scorekeeper-payload.helper';
import type { ScorekeeperQueuedOperation } from '../types/matches.types';
import type { ConflictRowView, QueuePanelView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface QueuePanelInput {
  readonly operations: readonly ScorekeeperQueuedOperation[];
  readonly conflicts: readonly ScorekeeperQueuedOperation[];
  readonly pendingCount: number;
  readonly isOffline: boolean;
  readonly isReplaying: boolean;
  readonly isAtLimit: boolean;
  readonly hasForeignQueue: boolean;
  readonly hasFailed: boolean;
  readonly onRetryFailed: () => void;
  readonly onDiscardConflict: (operationId: string) => void;
  readonly onReloadAuthoritative: () => void;
}

function buildConflictRows(t: Translate, input: QueuePanelInput): readonly ConflictRowView[] {
  return input.conflicts.map((operation) => ({
    key: operation.operationId,
    label: operation.operationId,
    queuedLabel: t(I18N_KEYS.scorekeeperQueue.conflictQueued),
    queuedValue: describeScorekeeperPayload(operation.payload),
    serverLabel: t(I18N_KEYS.scorekeeperQueue.conflictServer),
    serverValue: formatConflictServerValue(operation.conflictServerScore),
    discardLabel: t(I18N_KEYS.scorekeeperQueue.conflictDiscard),
    reloadLabel: t(I18N_KEYS.scorekeeperQueue.conflictReload),
    onDiscard: () => {
      input.onDiscardConflict(operation.operationId);
    },
    onReload: input.onReloadAuthoritative,
  }));
}

/**
 * The sync panel: one honest badge, the queue in recorded order, and any
 * conflict that needs a human decision.
 *
 * A conflict is presented as two competing records side by side — what this
 * device queued and what the server holds — with a discard or a reload. There
 * is deliberately no "merge" affordance: merging two divergent scores would
 * publish a number neither scorekeeper recorded.
 */
export function buildQueuePanel(t: Translate, input: QueuePanelInput): QueuePanelView {
  const badge = buildQueueBadge(t, {
    isOffline: input.isOffline,
    isReplaying: input.isReplaying,
    queuedCount: input.pendingCount,
  });
  return {
    heading: t(I18N_KEYS.scorekeeperQueue.panelHeading),
    intro: t(I18N_KEYS.scorekeeperQueue.panelIntro),
    badgeLabel: badge.label,
    badgeTone: badge.tone,
    rows: buildQueueRows(t, input.operations),
    syncedTitle: t(I18N_KEYS.scorekeeperQueue.syncedTitle),
    syncedMessage: t(I18N_KEYS.scorekeeperQueue.syncedMessage),
    retryLabel: t(I18N_KEYS.scorekeeperQueue.retryFailed),
    hasFailed: input.hasFailed,
    onRetryFailed: input.onRetryFailed,
    limitTitle: input.isAtLimit ? t(I18N_KEYS.scorekeeperQueue.limitTitle) : null,
    limitMessage: input.isAtLimit ? t(I18N_KEYS.scorekeeperQueue.limitMessage) : null,
    foreignTitle: input.hasForeignQueue ? t(I18N_KEYS.scorekeeperQueue.otherAccountTitle) : null,
    foreignMessage: input.hasForeignQueue
      ? t(I18N_KEYS.scorekeeperQueue.otherAccountMessage)
      : null,
    conflictHeading: t(I18N_KEYS.scorekeeperQueue.conflictHeading),
    conflictIntro: t(I18N_KEYS.scorekeeperQueue.conflictIntro),
    conflictNote: t(I18N_KEYS.scorekeeperQueue.conflictNeverMerged),
    conflicts: buildConflictRows(t, input),
  };
}
