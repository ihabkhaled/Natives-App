import { I18N_KEYS } from '@/shared/i18n';

import {
  QUEUE_KIND_LABEL_KEYS,
  QUEUE_STATE_LABEL_KEYS,
  QUEUE_STATE_TONES,
} from '../constants/matches-labels.constants';
import { SCOREKEEPER_OPERATION_KIND } from '../constants/matches.constants';
import { describeScorekeeperPayload } from './scorekeeper-payload.helper';
import type { ScorekeeperQueuedOperation } from '../types/matches.types';
import type { QueueRowView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

function operationLabel(t: Translate, operation: ScorekeeperQueuedOperation): string {
  const key = QUEUE_KIND_LABEL_KEYS[operation.kind];
  if (operation.kind === SCOREKEEPER_OPERATION_KIND.Void) {
    return t(key);
  }
  return t(key, { side: describeScorekeeperPayload(operation.payload) });
}

export function buildQueueRows(
  t: Translate,
  operations: readonly ScorekeeperQueuedOperation[],
): readonly QueueRowView[] {
  return operations.map((operation) => ({
    key: operation.operationId,
    label: operationLabel(t, operation),
    value: t(QUEUE_STATE_LABEL_KEYS[operation.state]),
    detail: t(I18N_KEYS.scorekeeperQueue.baseVersion, { version: operation.baseStreamVersion }),
    tone: QUEUE_STATE_TONES[operation.state],
  }));
}

/**
 * One badge that says exactly where the field stands: offline, replaying,
 * n queued, or fully synced. There is no fourth "probably fine" state.
 */
export function buildQueueBadge(
  t: Translate,
  input: { isOffline: boolean; isReplaying: boolean; queuedCount: number },
): { label: string; tone: string } {
  if (input.isOffline) {
    return { label: t(I18N_KEYS.scorekeeperQueue.offlineBadge), tone: 'warning' };
  }
  if (input.isReplaying) {
    return { label: t(I18N_KEYS.scorekeeperQueue.replayingBadge), tone: 'primary' };
  }
  if (input.queuedCount > 0) {
    return {
      label: t(I18N_KEYS.scorekeeperQueue.queuedBadge, { count: input.queuedCount }),
      tone: 'secondary',
    };
  }
  return { label: t(I18N_KEYS.scorekeeperQueue.onlineBadge), tone: 'success' };
}

/**
 * The server's own score for a conflicting operation, or a dash when the
 * request failed before the server could report one. It is never merged with
 * the queued value; the operator chooses which record stands.
 */
export function formatConflictServerValue(serverScore: string | null): string {
  return serverScore === null || serverScore === '' ? '—' : serverScore;
}
